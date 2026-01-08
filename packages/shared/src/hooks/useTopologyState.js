import { useState, useCallback, useEffect } from 'react';
import { createEmptyTopology, createDevice, createConnection, CANVAS_TYPES } from '../utils/fileFormat.js';

const STORAGE_KEY = 'scamp-topology';

/**
 * Load topology from localStorage
 */
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load topology from localStorage:', error);
  }
  return null;
}

/**
 * Save topology to localStorage
 */
function saveToStorage(topology) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topology));
  } catch (error) {
    console.error('Failed to save topology to localStorage:', error);
  }
}

/**
 * Custom hook for managing topology state with CRUD operations
 * Returns topology data and functions to manipulate it
 * Automatically persists to localStorage
 */
export function useTopologyState(initialTopology = null) {
  const [topology, setTopology] = useState(() => {
    // Try to load from localStorage first
    const stored = loadFromStorage();
    return stored || initialTopology || createEmptyTopology();
  });

  // Save to localStorage whenever topology changes
  useEffect(() => {
    saveToStorage(topology);
  }, [topology]);

  // Load a complete topology (for import)
  const loadTopology = useCallback((newTopology) => {
    setTopology(newTopology);
  }, []);

  // Reset to empty topology
  const resetTopology = useCallback((name = 'Untitled Setup') => {
    setTopology(createEmptyTopology(name));
  }, []);

  // Update topology name
  const setTopologyName = useCallback((name) => {
    setTopology(prev => ({ ...prev, name }));
  }, []);

  // Add a new device
  const addDevice = useCallback((deviceParams) => {
    const newDevice = createDevice(deviceParams);
    setTopology(prev => ({
      ...prev,
      devices: [...prev.devices, newDevice]
    }));
    return newDevice;
  }, []);

  // Update an existing device
  const updateDevice = useCallback((deviceId, updates) => {
    setTopology(prev => ({
      ...prev,
      devices: prev.devices.map(device =>
        device.id === deviceId
          ? { ...device, ...updates }
          : device
      )
    }));
  }, []);

  // Remove a device (also removes associated connections)
  const removeDevice = useCallback((deviceId) => {
    setTopology(prev => ({
      ...prev,
      devices: prev.devices.filter(device => device.id !== deviceId),
      connections: prev.connections.filter(
        conn => conn.source !== deviceId && conn.target !== deviceId
      )
    }));
  }, []);

  // Update device position (for drag operations)
  const updateDevicePosition = useCallback((deviceId, position) => {
    updateDevice(deviceId, { position });
  }, [updateDevice]);

  // Move device to different canvas
  const moveDeviceToCanvas = useCallback((deviceId, canvas) => {
    updateDevice(deviceId, { canvas });
  }, [updateDevice]);

  // Add a new connection
  const addConnection = useCallback((connectionParams) => {
    const newConnection = createConnection(connectionParams);
    setTopology(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
    return newConnection;
  }, []);

  // Update an existing connection
  const updateConnection = useCallback((connectionId, updates) => {
    setTopology(prev => ({
      ...prev,
      connections: prev.connections.map(conn =>
        conn.id === connectionId
          ? { ...conn, ...updates }
          : conn
      )
    }));
  }, []);

  // Remove a connection
  const removeConnection = useCallback((connectionId) => {
    setTopology(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  }, []);

  // Get devices for a specific canvas
  const getDevicesByCanvas = useCallback((canvas) => {
    return topology.devices.filter(device => device.canvas === canvas);
  }, [topology.devices]);

  // Get connections for a specific canvas (both devices must be on that canvas)
  const getConnectionsByCanvas = useCallback((canvas) => {
    const deviceIds = new Set(
      topology.devices
        .filter(device => device.canvas === canvas)
        .map(device => device.id)
    );

    return topology.connections.filter(
      conn => deviceIds.has(conn.source) && deviceIds.has(conn.target)
    );
  }, [topology.devices, topology.connections]);

  // Copy all devices and connections from current to target canvas
  const copyCurrentToTarget = useCallback(() => {
    const currentDevices = getDevicesByCanvas(CANVAS_TYPES.CURRENT);
    const currentConnections = getConnectionsByCanvas(CANVAS_TYPES.CURRENT);

    // Create mapping of old IDs to new IDs
    const idMap = {};

    // Copy devices with new IDs
    const newDevices = currentDevices.map(device => {
      const newDevice = createDevice({
        ...device,
        canvas: CANVAS_TYPES.TARGET,
        detectionId: null // Clear detection ID for target
      });
      idMap[device.id] = newDevice.id;
      return newDevice;
    });

    // Copy connections with new IDs and mapped device references
    const newConnections = currentConnections.map(conn => {
      return createConnection({
        ...conn,
        source: idMap[conn.source],
        target: idMap[conn.target]
      });
    });

    // Add to topology
    setTopology(prev => ({
      ...prev,
      devices: [...prev.devices, ...newDevices],
      connections: [...prev.connections, ...newConnections]
    }));
  }, [getDevicesByCanvas, getConnectionsByCanvas]);

  return {
    // State
    topology,

    // Load/Reset
    loadTopology,
    resetTopology,
    setTopologyName,

    // Device operations
    addDevice,
    updateDevice,
    removeDevice,
    updateDevicePosition,
    moveDeviceToCanvas,

    // Connection operations
    addConnection,
    updateConnection,
    removeConnection,

    // Query operations
    getDevicesByCanvas,
    getConnectionsByCanvas,

    // Bulk operations
    copyCurrentToTarget
  };
}
