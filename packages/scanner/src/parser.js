/**
 * Generate a unique detection ID for a device
 */
function generateDetectionId(prefix, name, vendor, product, locationId) {
  const parts = [prefix, name, vendor, product, locationId].filter(Boolean);
  return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
}

/**
 * Parse USB devices recursively, building a tree of devices and their connections
 * @param {Array} usbBuses - USB buses from system_profiler
 * @param {string} parentId - Parent device ID (null for root)
 * @param {Array} devices - Accumulated devices array
 * @param {Array} connections - Accumulated connections array
 * @param {number} depth - Current depth in hierarchy
 */
function parseUSBDevices(usbBuses, parentId, devices, connections, depth = 0) {
  if (!usbBuses || !Array.isArray(usbBuses)) return;

  for (const bus of usbBuses) {
    // Process items in this bus
    if (bus._items && Array.isArray(bus._items)) {
      parseUSBItems(bus._items, parentId, devices, connections, depth);
    }
  }
}

/**
 * Parse USB items (devices/hubs) recursively
 */
function parseUSBItems(items, parentId, devices, connections, depth) {
  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    const name = item._name || 'Unknown USB Device';
    const vendorId = item.vendor_id || '';
    const productId = item.product_id || '';
    const locationId = item.location_id || '';

    // Generate unique detection ID (includes location to distinguish identical hubs)
    const detectionId = generateDetectionId('usb', name, vendorId, productId, locationId);

    // Determine if this is a hub (has downstream devices)
    const isHub = item._items && Array.isArray(item._items) && item._items.length > 0;

    // Skip generic "hub_device" entries without downstream devices (USB controllers)
    if (name.toLowerCase() === 'hub_device' && !isHub) {
      // Recursively process children anyway, but keep the PARENT id (don't use skipped device's id)
      if (item._items) {
        parseUSBItems(item._items, parentId, devices, connections, depth);
      }
      continue;
    }

    // Create device entry
    const device = {
      detectionId,
      name,
      type: isHub ? 'hub' : 'usb-device',
      metadata: {
        vendor_id: vendorId,
        product_id: productId,
        location_id: item.location_id,
        serial_num: item.serial_num,
      },
      depth: depth + 1,
    };

    devices.push(device);

    // Create connection to parent if exists
    if (parentId) {
      connections.push({
        source: parentId,
        target: detectionId,
        type: 'usb',
      });
    }

    // Recursively process children
    if (item._items) {
      parseUSBItems(item._items, detectionId, devices, connections, depth + 1);
    }
  }
}

/**
 * Parse Thunderbolt devices
 * @param {Object} thunderboltData - Thunderbolt data from system_profiler
 * @param {Array} devices - Accumulated devices array
 * @param {Array} connections - Accumulated connections array
 */
function parseThunderboltDevices(thunderboltData, devices, connections) {
  if (!thunderboltData || !thunderboltData.SPThunderboltDataType) return;

  const tbData = thunderboltData.SPThunderboltDataType;
  if (!Array.isArray(tbData)) return;

  for (const controller of tbData) {
    // Some controllers might have devices attached
    if (controller.device_name && controller.device_name !== 'Thunderbolt Bus') {
      const name = controller.device_name;
      const detectionId = generateDetectionId('tb', name, controller.vendor_id, controller.device_id, null);

      devices.push({
        detectionId,
        name,
        type: 'thunderbolt-device',
        metadata: {
          vendor_id: controller.vendor_id,
          device_id: controller.device_id,
          port_type: controller.port_type,
        },
        depth: 1,
      });

      // Connection to computer
      connections.push({
        source: 'computer',
        target: detectionId,
        type: 'thunderbolt',
      });
    }
  }
}

/**
 * Parse display devices
 * @param {Object} displayData - Display data from system_profiler
 * @param {Array} devices - Accumulated devices array
 * @param {Array} connections - Accumulated connections array
 */
function parseDisplays(displayData, devices, connections) {
  if (!displayData || !displayData.SPDisplaysDataType) return;

  const displaysData = displayData.SPDisplaysDataType;
  if (!Array.isArray(displaysData)) return;

  for (const displayGroup of displaysData) {
    // Look for displays in spdisplays_ndrvs array
    if (displayGroup.spdisplays_ndrvs && Array.isArray(displayGroup.spdisplays_ndrvs)) {
      for (const display of displayGroup.spdisplays_ndrvs) {
        const name = display._name || 'Unknown Display';
        const displayId = display._spdisplays_displayID || display._spdisplays_display_id;
        const detectionId = generateDetectionId('display', name, display['_spdisplays_display-vendor-id'], display['_spdisplays_display-product-id'], displayId);

        // Determine connection type
        let connectionType = 'displayport'; // default
        const connType = display.spdisplays_connection_type || '';
        if (connType.toLowerCase().includes('hdmi')) {
          connectionType = 'hdmi';
        } else if (connType.toLowerCase().includes('displayport') || connType.toLowerCase().includes('dp')) {
          connectionType = 'displayport';
        } else if (connType.toLowerCase().includes('thunderbolt')) {
          connectionType = 'thunderbolt';
        }

        devices.push({
          detectionId,
          name,
          type: 'display',
          metadata: {
            connection_type: connType,
            resolution: display._spdisplays_resolution,
          },
          depth: 1,
          connectionType, // Store for later use
        });

        // Connection to computer
        connections.push({
          source: 'computer',
          target: detectionId,
          type: connectionType,
        });
      }
    }
  }
}

/**
 * Check if a network interface is actually connected/active
 * @param {Object} netInterface - Network interface data
 * @returns {boolean} True if interface is active
 */
function isNetworkInterfaceActive(netInterface) {
  // Check if it has an assigned IP address
  if (netInterface.IPv4 && netInterface.IPv4.Addresses && netInterface.IPv4.Addresses.length > 0) {
    return true;
  }

  // Check if Ethernet link is active (cable connected)
  if (netInterface.Ethernet && netInterface.Ethernet.MediaSubType) {
    const media = netInterface.Ethernet.MediaSubType;
    // "none" means no cable connected, anything else means active
    if (media !== 'none' && media !== '') {
      return true;
    }
  }

  return false;
}

/**
 * Parse network devices
 * @param {Object} networkData - Network data from system_profiler
 * @param {Array} devices - Accumulated devices array
 * @param {Array} connections - Accumulated connections array
 */
function parseNetworkDevices(networkData, devices, connections) {
  if (!networkData || !networkData.SPNetworkDataType) return;

  const netData = networkData.SPNetworkDataType;
  if (!Array.isArray(netData)) return;

  for (const netInterface of netData) {
    const name = netInterface._name || netInterface.interface || 'Unknown Network Device';
    const type = netInterface.type || '';
    const interfaceName = netInterface.interface || '';

    // Filter out virtual/bridge interfaces
    if (name.toLowerCase().includes('bridge') || interfaceName.includes('bridge')) {
      continue;
    }

    // Filter out generic "Ethernet Adapter (enX)" entries - these are often virtual
    if (name.match(/^Ethernet Adapter \(en\d+\)$/)) {
      continue;
    }

    // Check if it's an Ethernet adapter (especially USB-to-Ethernet)
    const isEthernet = type.toLowerCase().includes('ethernet') ||
                       name.toLowerCase().includes('ethernet') ||
                       name.toLowerCase().includes('lan');

    // Only include if the interface is actually active/connected
    if (!isEthernet || !isNetworkInterfaceActive(netInterface)) {
      continue;
    }

    const isUSBBased = netInterface.USB && netInterface.USB.toLowerCase().includes('yes');

    const detectionId = generateDetectionId('net', name, netInterface.vendor_id, netInterface.product_id, netInterface.interface);

    // USB-to-Ethernet adapters should be 'adapter' type
    const deviceType = isUSBBased ? 'adapter' : 'network-device';

    devices.push({
      detectionId,
      name,
      type: deviceType,
      metadata: {
        interface: netInterface.interface,
        type: type,
        hardware: netInterface.hardware,
      },
      depth: 1,
    });

    // Connection to computer (USB for adapters, ethernet for built-in)
    connections.push({
      source: 'computer',
      target: detectionId,
      type: isUSBBased ? 'usb' : 'ethernet',
    });
  }
}

/**
 * Parse all system profiler data and build device tree
 * @param {Object} profilerData - Combined profiler data
 * @returns {Object} { devices, connections }
 */
export function parseProfilerData(profilerData) {
  const devices = [];
  const connections = [];

  // Always add the computer as the root device
  devices.push({
    detectionId: 'computer',
    name: 'Mac',
    type: 'computer',
    metadata: {},
    depth: 0,
  });

  // Parse each data type
  if (profilerData.usb) {
    parseUSBDevices(profilerData.usb.SPUSBDataType, 'computer', devices, connections, 0);
  }

  if (profilerData.thunderbolt) {
    parseThunderboltDevices(profilerData.thunderbolt, devices, connections);
  }

  if (profilerData.displays) {
    parseDisplays(profilerData.displays, devices, connections);
  }

  // Parse network devices (only active/connected interfaces)
  if (profilerData.network) {
    parseNetworkDevices(profilerData.network, devices, connections);
  }

  console.log(`Found ${devices.length - 1} devices (${connections.length} connections)`);

  return { devices, connections };
}
