// Transform topology data to React Flow format and vice versa

import { DEVICE_TYPES, CONNECTION_TYPES } from './fileFormat.js';

/**
 * Transform a device object to a React Flow node
 * @param {Object} device - Device from topology
 * @param {Array} connectionTypes - Optional array of connection types with colors
 * @returns {Object} React Flow node
 */
export function deviceToNode(device, connectionTypes = null) {
  return {
    id: device.id,
    type: device.type, // Maps to custom node component
    position: device.position,
    data: {
      label: device.label,
      detectionId: device.detectionId,
      canvas: device.canvas,
      deviceType: device.type,
      ports: device.ports || [],
      connectionTypes: connectionTypes
    }
  };
}

/**
 * Transform a connection object to a React Flow edge
 * @param {Object} connection - Connection from topology
 * @param {Array} connectionTypes - Optional array of connection types with colors
 * @returns {Object} React Flow edge
 */
export function connectionToEdge(connection, connectionTypes = null) {
  return {
    id: connection.id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourcePort, // React Flow uses "handle" terminology
    targetHandle: connection.targetPort,
    type: 'connection', // Custom edge type
    data: {
      connectionType: connection.type,
      label: connection.label,
      sourcePort: connection.sourcePort,
      targetPort: connection.targetPort,
      connectionTypes: connectionTypes
    },
    animated: false,
    style: getEdgeStyle(connection.type, connectionTypes)
  };
}

/**
 * Get edge styling based on connection type
 * @param {string} connectionType - Type of connection
 * @param {Array} connectionTypes - Optional array of connection types with colors
 * @returns {Object} Style object
 */
function getEdgeStyle(connectionType, connectionTypes = null) {
  // If connectionTypes is provided, use dynamic colors
  if (connectionTypes && connectionTypes.length > 0) {
    const ct = connectionTypes.find(type => type.id === connectionType);
    if (ct) {
      return {
        stroke: ct.color,
        strokeWidth: connectionType === CONNECTION_TYPES.THUNDERBOLT ? 3 : 2
      };
    }
  }

  // Fall back to hardcoded colors for backwards compatibility
  const styles = {
    [CONNECTION_TYPES.USB]: {
      stroke: 'var(--color-connection-usb, #f4c430)',
      strokeWidth: 2
    },
    [CONNECTION_TYPES.THUNDERBOLT]: {
      stroke: 'var(--color-connection-thunderbolt, #4169e1)',
      strokeWidth: 3
    },
    [CONNECTION_TYPES.ETHERNET]: {
      stroke: 'var(--color-connection-ethernet, #32cd32)',
      strokeWidth: 2
    },
    [CONNECTION_TYPES.DISPLAYPORT]: {
      stroke: 'var(--color-connection-displayport, #9370db)',
      strokeWidth: 2
    },
    [CONNECTION_TYPES.HDMI]: {
      stroke: 'var(--color-connection-hdmi, #ff6347)',
      strokeWidth: 2
    }
  };

  return styles[connectionType] || { stroke: '#999999', strokeWidth: 2 };
}

/**
 * Transform entire topology to React Flow data
 * @param {Object} topology - Complete topology object
 * @param {string} canvas - Which canvas to render ('current' or 'target')
 * @returns {Object} { nodes, edges }
 */
export function topologyToReactFlow(topology, canvas = 'current') {
  // Filter devices by canvas
  const canvasDevices = topology.devices.filter(device => device.canvas === canvas);
  const canvasDeviceIds = new Set(canvasDevices.map(d => d.id));

  // Get connection types from topology
  const connectionTypes = topology.connectionTypes || null;

  // Transform devices to nodes
  const nodes = canvasDevices.map(device => deviceToNode(device, connectionTypes));

  // Filter connections where both source and target are on this canvas
  const canvasConnections = topology.connections.filter(
    conn => canvasDeviceIds.has(conn.source) && canvasDeviceIds.has(conn.target)
  );

  // Transform connections to edges
  const edges = canvasConnections.map(connection => connectionToEdge(connection, connectionTypes));

  return { nodes, edges };
}

/**
 * Transform React Flow node back to device object
 * @param {Object} node - React Flow node
 * @returns {Object} Device object
 */
export function nodeToDevice(node) {
  return {
    id: node.id,
    type: node.data.deviceType || node.type,
    label: node.data.label,
    detectionId: node.data.detectionId || null,
    position: node.position,
    canvas: node.data.canvas
  };
}

/**
 * Transform React Flow edge back to connection object
 * @param {Object} edge - React Flow edge
 * @returns {Object} Connection object
 */
export function edgeToConnection(edge) {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourcePort: edge.data.sourcePort || edge.sourceHandle,
    targetPort: edge.data.targetPort || edge.targetHandle,
    type: edge.data.connectionType,
    label: edge.data.label || ''
  };
}
