// File format utilities for Scamp topology files
// Based on PROJECT_OVERVIEW.md specification

// Device type constants
export const DEVICE_TYPES = {
  COMPUTER: 'computer',
  HUB: 'hub',
  DISPLAY: 'display',
  USB_DEVICE: 'usb-device',
  NETWORK_DEVICE: 'network-device',
  THUNDERBOLT_DEVICE: 'thunderbolt-device',
  ADAPTER: 'adapter',
  OTHER: 'other'
};

// Connection type constants (for backwards compatibility)
export const CONNECTION_TYPES = {
  USB: 'usb',
  THUNDERBOLT: 'thunderbolt',
  ETHERNET: 'ethernet',
  DISPLAYPORT: 'displayport',
  HDMI: 'hdmi'
};

// Default connection types with colors
export const DEFAULT_CONNECTION_TYPES = [
  { id: 'usb', name: 'USB', color: '#4169e1' },
  { id: 'thunderbolt', name: 'Thunderbolt', color: '#f4c430' },
  { id: 'ethernet', name: 'Ethernet', color: '#32cd32' },
  { id: 'displayport', name: 'DisplayPort', color: '#9370db' },
  { id: 'hdmi', name: 'HDMI', color: '#ff6347' }
];

// Canvas type constants
export const CANVAS_TYPES = {
  CURRENT: 'current',
  TARGET: 'target'
};

// Port position constants
export const PORT_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
};

// Port direction constants
export const PORT_DIRECTIONS = {
  IN: 'in',           // Target only (receives data)
  OUT: 'out',         // Source only (sends data)
  BIDIRECTIONAL: 'bidirectional'  // Both source and target
};

// Current file format version
export const FILE_FORMAT_VERSION = '1.0';

// Default port configurations for each device type
const DEFAULT_PORTS = {
  [DEVICE_TYPES.COMPUTER]: [
    { id: 'thunderbolt-1', label: 'TB1', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.BIDIRECTIONAL },
    { id: 'thunderbolt-2', label: 'TB2', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.BIDIRECTIONAL },
    { id: 'thunderbolt-3', label: 'TB3', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.BIDIRECTIONAL },
    { id: 'usb-c-1', label: 'USB-C 1', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.BIDIRECTIONAL },
    { id: 'usb-c-2', label: 'USB-C 2', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.BIDIRECTIONAL }
  ],
  [DEVICE_TYPES.HUB]: [
    { id: 'upstream', label: 'Upstream', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.IN },
    { id: 'usb-1', label: 'USB 1', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.OUT },
    { id: 'usb-2', label: 'USB 2', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.OUT },
    { id: 'usb-3', label: 'USB 3', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.OUT },
    { id: 'usb-4', label: 'USB 4', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.OUT }
  ],
  [DEVICE_TYPES.DISPLAY]: [
    { id: 'upstream', label: 'Input', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.TOP, direction: PORT_DIRECTIONS.IN },
    { id: 'downstream', label: 'Output', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.BOTTOM, direction: PORT_DIRECTIONS.OUT }
  ],
  [DEVICE_TYPES.USB_DEVICE]: [
    { id: 'usb', label: 'USB', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.IN }
  ],
  [DEVICE_TYPES.NETWORK_DEVICE]: [
    { id: 'usb', label: 'USB', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.IN },
    { id: 'ethernet', label: 'Ethernet', type: CONNECTION_TYPES.ETHERNET, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.BIDIRECTIONAL }
  ],
  [DEVICE_TYPES.THUNDERBOLT_DEVICE]: [
    { id: 'thunderbolt', label: 'TB', type: CONNECTION_TYPES.THUNDERBOLT, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.BIDIRECTIONAL }
  ],
  [DEVICE_TYPES.ADAPTER]: [
    { id: 'input', label: 'In', type: CONNECTION_TYPES.USB, position: PORT_POSITIONS.LEFT, direction: PORT_DIRECTIONS.IN },
    { id: 'output', label: 'Out', type: CONNECTION_TYPES.ETHERNET, position: PORT_POSITIONS.RIGHT, direction: PORT_DIRECTIONS.OUT }
  ],
  [DEVICE_TYPES.OTHER]: [] // No default ports - user can add their own
};

// Factory function to create a new empty topology
export function createEmptyTopology(name = 'Untitled Setup') {
  return {
    version: FILE_FORMAT_VERSION,
    name,
    devices: [],
    connections: [],
    connectionTypes: JSON.parse(JSON.stringify(DEFAULT_CONNECTION_TYPES))
  };
}

// Factory function to create a new device
export function createDevice({
  type,
  label,
  position = { x: 0, y: 0 },
  canvas = CANVAS_TYPES.CURRENT,
  detectionId = null,
  ports = null
}) {
  // Use provided ports or default ports for this device type
  const devicePorts = ports || (DEFAULT_PORTS[type] ? JSON.parse(JSON.stringify(DEFAULT_PORTS[type])) : []);

  return {
    id: generateId('device'),
    type,
    label,
    detectionId,
    position,
    canvas,
    ports: devicePorts
  };
}

// Factory function to create a new connection
export function createConnection({
  source,
  target,
  sourcePort,
  targetPort,
  type,
  label = ''
}) {
  return {
    id: generateId('conn'),
    source,
    target,
    sourcePort,
    targetPort,
    type,
    label
  };
}

// Factory function to create a new port
export function createPort({
  label,
  type = CONNECTION_TYPES.USB,
  position = PORT_POSITIONS.RIGHT,
  direction = PORT_DIRECTIONS.BIDIRECTIONAL
}) {
  return {
    id: generateId('port'),
    label,
    type,
    position,
    direction
  };
}

// Factory function to create a new connection type
export function createConnectionType({
  name,
  color = '#888888'
}) {
  return {
    id: generateId('ctype'),
    name,
    color
  };
}

// Generate a unique ID
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`;
}

// Validate topology structure
export function validateTopology(topology) {
  const errors = [];

  // Check required top-level fields
  if (!topology) {
    return { valid: false, errors: ['Topology is null or undefined'] };
  }

  if (!topology.version) {
    errors.push('Missing version field');
  }

  if (!topology.name || typeof topology.name !== 'string') {
    errors.push('Missing or invalid name field');
  }

  if (!Array.isArray(topology.devices)) {
    errors.push('Missing or invalid devices array');
    return { valid: false, errors };
  }

  if (!Array.isArray(topology.connections)) {
    errors.push('Missing or invalid connections array');
    return { valid: false, errors };
  }

  // connectionTypes field is optional for backwards compatibility
  // Build a set of all valid connection type IDs
  let validConnectionTypeIds = new Set(Object.values(CONNECTION_TYPES));

  if (topology.connectionTypes) {
    if (!Array.isArray(topology.connectionTypes)) {
      errors.push('connectionTypes must be an array');
    } else {
      // Add custom connection type IDs to the valid set
      topology.connectionTypes.forEach(ct => {
        if (ct && ct.id) {
          validConnectionTypeIds.add(ct.id);
        }
      });
    }
  }

  // Validate devices
  const deviceIds = new Set();
  const validDeviceTypes = Object.values(DEVICE_TYPES);

  topology.devices.forEach((device, index) => {
    if (!device.id) {
      errors.push(`Device at index ${index} missing id`);
    } else if (deviceIds.has(device.id)) {
      errors.push(`Duplicate device id: ${device.id}`);
    } else {
      deviceIds.add(device.id);
    }

    if (!device.type || !validDeviceTypes.includes(device.type)) {
      errors.push(`Device ${device.id || index} has invalid type: ${device.type}`);
    }

    if (!device.label || typeof device.label !== 'string') {
      errors.push(`Device ${device.id || index} missing or invalid label`);
    }

    if (!device.position || typeof device.position.x !== 'number' || typeof device.position.y !== 'number') {
      errors.push(`Device ${device.id || index} has invalid position`);
    }

    if (!device.canvas || !Object.values(CANVAS_TYPES).includes(device.canvas)) {
      errors.push(`Device ${device.id || index} has invalid canvas: ${device.canvas}`);
    }
  });

  // Validate connections
  topology.connections.forEach((conn, index) => {
    if (!conn.id) {
      errors.push(`Connection at index ${index} missing id`);
    }

    if (!conn.source || !deviceIds.has(conn.source)) {
      errors.push(`Connection ${conn.id || index} references invalid source device: ${conn.source}`);
    }

    if (!conn.target || !deviceIds.has(conn.target)) {
      errors.push(`Connection ${conn.id || index} references invalid target device: ${conn.target}`);
    }

    if (!conn.type || !validConnectionTypeIds.has(conn.type)) {
      errors.push(`Connection ${conn.id || index} has invalid type: ${conn.type}`);
    }

    if (!conn.sourcePort || typeof conn.sourcePort !== 'string') {
      errors.push(`Connection ${conn.id || index} missing or invalid sourcePort`);
    }

    if (!conn.targetPort || typeof conn.targetPort !== 'string') {
      errors.push(`Connection ${conn.id || index} missing or invalid targetPort`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// Parse JSON string and validate
export function parseTopologyFile(jsonString) {
  try {
    const topology = JSON.parse(jsonString);

    // Backwards compatibility: add default connection types if missing
    if (!topology.connectionTypes) {
      topology.connectionTypes = JSON.parse(JSON.stringify(DEFAULT_CONNECTION_TYPES));
    }

    const validation = validateTopology(topology);

    if (!validation.valid) {
      return {
        success: false,
        error: 'Invalid topology file',
        details: validation.errors
      };
    }

    return {
      success: true,
      topology
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse JSON',
      details: [error.message]
    };
  }
}

// Convert topology to JSON string
export function stringifyTopology(topology) {
  const validation = validateTopology(topology);

  if (!validation.valid) {
    throw new Error(`Cannot stringify invalid topology: ${validation.errors.join(', ')}`);
  }

  return JSON.stringify(topology, null, 2);
}
