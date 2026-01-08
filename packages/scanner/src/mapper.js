import {
  createEmptyTopology,
  createDevice,
  createConnection,
  DEVICE_TYPES,
  CONNECTION_TYPES,
} from '@scamp/shared/utils';

/**
 * Map parsed device type to topology device type
 * @param {string} parsedType - Device type from parser
 * @returns {string} Topology device type constant
 */
function mapDeviceType(parsedType) {
  const typeMap = {
    'computer': DEVICE_TYPES.COMPUTER,
    'hub': DEVICE_TYPES.HUB,
    'usb-device': DEVICE_TYPES.USB_DEVICE,
    'thunderbolt-device': DEVICE_TYPES.THUNDERBOLT_DEVICE,
    'display': DEVICE_TYPES.DISPLAY,
    'network-device': DEVICE_TYPES.NETWORK_DEVICE,
    'adapter': DEVICE_TYPES.ADAPTER,
  };

  return typeMap[parsedType] || DEVICE_TYPES.OTHER;
}

/**
 * Map connection type string to topology connection type
 * @param {string} connType - Connection type from parser
 * @returns {string} Topology connection type constant
 */
function mapConnectionType(connType) {
  const typeMap = {
    'usb': CONNECTION_TYPES.USB,
    'thunderbolt': CONNECTION_TYPES.THUNDERBOLT,
    'ethernet': CONNECTION_TYPES.ETHERNET,
    'displayport': CONNECTION_TYPES.DISPLAYPORT,
    'hdmi': CONNECTION_TYPES.HDMI,
  };

  return typeMap[connType] || CONNECTION_TYPES.USB;
}

/**
 * Find port on device that matches connection type
 * @param {Object} device - Topology device object
 * @param {string} connectionType - Connection type to match
 * @param {boolean} isSource - Whether device is connection source
 * @returns {string|null} Port ID or null if not found
 */
function findMatchingPort(device, connectionType, isSource) {
  if (!device.ports || device.ports.length === 0) return null;

  // For hubs, use upstream port for incoming, downstream for outgoing
  if (device.type === DEVICE_TYPES.HUB) {
    if (!isSource) {
      // Hub is target, use upstream port
      const upstreamPort = device.ports.find(p => p.id === 'upstream' || p.label.toLowerCase().includes('upstream'));
      return upstreamPort ? upstreamPort.id : device.ports[0].id;
    } else {
      // Hub is source, use first downstream port that matches type
      const downstreamPorts = device.ports.filter(p => p.id !== 'upstream' && !p.label.toLowerCase().includes('upstream'));
      const matchingPort = downstreamPorts.find(p => p.type === connectionType);
      return matchingPort ? matchingPort.id : (downstreamPorts[0] ? downstreamPorts[0].id : device.ports[0].id);
    }
  }

  // For other devices, try to find port matching connection type
  const matchingPort = device.ports.find(p => p.type === connectionType);
  if (matchingPort) return matchingPort.id;

  // Fall back to first port
  return device.ports[0].id;
}

/**
 * Map parsed devices and connections to topology format
 * @param {Object} parsedData - { devices, connections } from parser
 * @param {Object} positions - { deviceId: {x, y} } position map
 * @param {string} setupName - Name for the topology
 * @returns {Object} Complete topology object
 */
export function mapToTopology(parsedData, positions, setupName) {
  const topology = createEmptyTopology(setupName);

  // Map to store device IDs (detectionId -> topology device id)
  const deviceIdMap = new Map();

  // Create topology devices
  for (const parsedDevice of parsedData.devices) {
    const position = positions[parsedDevice.detectionId] || { x: 0, y: 0 };

    const topologyDevice = createDevice({
      type: mapDeviceType(parsedDevice.type),
      label: parsedDevice.name,
      position,
      canvas: 'current',
      detectionId: parsedDevice.detectionId,
      ports: null, // Use defaults from createDevice
    });

    // Store mapping for connection creation
    deviceIdMap.set(parsedDevice.detectionId, topologyDevice.id);

    topology.devices.push(topologyDevice);
  }

  // Create topology connections
  for (const parsedConnection of parsedData.connections) {
    const sourceDeviceId = deviceIdMap.get(parsedConnection.source);
    const targetDeviceId = deviceIdMap.get(parsedConnection.target);

    if (!sourceDeviceId || !targetDeviceId) {
      console.warn(`Warning: Could not create connection between ${parsedConnection.source} and ${parsedConnection.target}`);
      continue;
    }

    // Find the actual device objects to access their ports
    const sourceDevice = topology.devices.find(d => d.id === sourceDeviceId);
    const targetDevice = topology.devices.find(d => d.id === targetDeviceId);

    if (!sourceDevice || !targetDevice) {
      console.warn(`Warning: Could not find devices for connection`);
      continue;
    }

    // Find appropriate ports
    const connectionType = mapConnectionType(parsedConnection.type);
    const sourcePort = findMatchingPort(sourceDevice, connectionType, true);
    const targetPort = findMatchingPort(targetDevice, connectionType, false);

    if (!sourcePort || !targetPort) {
      console.warn(`Warning: Could not find ports for connection between ${sourceDevice.label} and ${targetDevice.label}`);
      continue;
    }

    const topologyConnection = createConnection({
      source: sourceDeviceId,
      target: targetDeviceId,
      sourcePort,
      targetPort,
      type: connectionType,
      label: '',
    });

    topology.connections.push(topologyConnection);
  }

  return topology;
}
