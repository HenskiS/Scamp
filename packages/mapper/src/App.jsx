import { createContext, useState, useEffect } from 'react';
import { TopologyCanvas, useTopologyState, useFileIO, CONNECTION_TYPES } from '@scamp/shared';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import DeviceEditor from './components/DeviceEditor/DeviceEditor.jsx';
import ConnectionEditor from './components/ConnectionEditor/ConnectionEditor.jsx';
import EventLog from './components/EventLog/EventLog.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import '@scamp/shared/styles';
import styles from './App.module.css';

// Create context for topology state
export const TopologyContext = createContext(null);

function App() {
  // Initialize topology state
  const topologyState = useTopologyState();
  const [activeCanvas, setActiveCanvas] = useState('current');
  const { importTopology, exportTopology } = useFileIO();
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);
  const [events, setEvents] = useState([]);
  const [showPortLabels, setShowPortLabels] = useState(() => {
    const saved = localStorage.getItem('showPortLabels');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [highlightedDeviceId, setHighlightedDeviceId] = useState(null);
  const [highlightedConnectionId, setHighlightedConnectionId] = useState(null);

  // Save port label preference to localStorage
  useEffect(() => {
    localStorage.setItem('showPortLabels', JSON.stringify(showPortLabels));
  }, [showPortLabels]);

  // Helper to log events
  const logEvent = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [...prev, { timestamp, type, message }]);
  };

  // Toggle port labels
  const handleTogglePortLabels = () => {
    const newValue = !showPortLabels;
    setShowPortLabels(newValue);
    localStorage.setItem('showPortLabels', JSON.stringify(newValue));
    logEvent('VIEW_SETTING', `Port labels ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Handle file import
  const handleImport = async () => {
    try {
      const result = await importTopology();
      topologyState.loadTopology(result.topology);
      logEvent('FILE_IMPORT', `Loaded ${result.filename} (${result.topology.devices.length} devices, ${result.topology.connections.length} connections)`);
    } catch (error) {
      logEvent('ERROR', `Failed to import: ${error.message}`);
    }
  };

  // Handle file export
  const handleExport = () => {
    const result = exportTopology(topologyState.topology);
    if (result.success) {
      logEvent('FILE_EXPORT', `Exported to ${result.filename}`);
    } else {
      logEvent('ERROR', `Failed to export: ${result.error}`);
    }
  };

  // Handle new topology
  const handleNew = () => {
    if (confirm('Create new topology? Unsaved changes will be lost.')) {
      topologyState.resetTopology();
      setEvents([]);  // Clear event log for new topology
      logEvent('TOPOLOGY_NEW', 'Created new topology');
    }
  };

  // Handle device position updates when dragged
  const handleDeviceMove = (deviceId, position) => {
    topologyState.updateDevicePosition(deviceId, position);
  };

  // Handle new connection creation when dragging between ports
  const handleConnect = (connection) => {
    // Determine connection type based on actual port types
    let connectionType = CONNECTION_TYPES.USB; // Default

    // Find source and target devices
    const sourceDevice = topologyState.topology.devices.find(d => d.id === connection.source);
    const targetDevice = topologyState.topology.devices.find(d => d.id === connection.target);

    // Find the actual port objects
    const sourcePort = sourceDevice?.ports?.find(p => p.id === connection.sourceHandle);
    const targetPort = targetDevice?.ports?.find(p => p.id === connection.targetHandle);

    // Use the port type if available, prefer source port type
    if (sourcePort?.type) {
      connectionType = sourcePort.type;
    } else if (targetPort?.type) {
      connectionType = targetPort.type;
    }

    topologyState.addConnection({
      source: connection.source,
      target: connection.target,
      sourcePort: connection.sourceHandle || 'port',
      targetPort: connection.targetHandle || 'port',
      type: connectionType,
      label: ''
    });

    logEvent('CONNECTION_ADD', `Created ${connectionType} connection`);
  };

  // Handle connection deletion
  const handleEdgeDelete = (edgeId) => {
    topologyState.removeConnection(edgeId);
    logEvent('CONNECTION_DELETE', `Deleted connection ${edgeId}`);
  };

  // Handle adding a new device
  const handleAddDevice = (deviceType, position = null) => {
    const deviceLabel = prompt(`Enter name for new ${deviceType}:`);
    if (!deviceLabel) return;

    // Use provided position or add device at center of canvas with slight random offset
    const devicePosition = position || {
      x: 200 + Math.floor(Math.random() * 100) - 50,
      y: 200 + Math.floor(Math.random() * 100) - 50
    };

    topologyState.addDevice({
      type: deviceType,
      label: deviceLabel,
      position: devicePosition,
      canvas: activeCanvas
    });

    logEvent('DEVICE_ADD', `Added ${deviceType} "${deviceLabel}" to ${activeCanvas} canvas`);
  };

  // Handle dropping a device onto the canvas
  const handleCanvasDrop = (deviceType, position) => {
    handleAddDevice(deviceType, position);
  };

  // Handle device deletion
  const handleDeviceDelete = (deviceId) => {
    const device = topologyState.topology.devices.find(d => d.id === deviceId);
    topologyState.removeDevice(deviceId);
    logEvent('DEVICE_DELETE', `Deleted device "${device?.label || deviceId}"`);
  };

  // Handle node double-click to edit device
  const handleNodeDoubleClick = (event, node) => {
    const device = topologyState.topology.devices.find(d => d.id === node.id);
    if (device) {
      setEditingDevice(device);
    }
  };

  // Handle edge double-click to edit connection
  const handleEdgeDoubleClick = (event, edge) => {
    const connection = topologyState.topology.connections.find(c => c.id === edge.id);
    if (connection) {
      setEditingConnection(connection);
    }
  };

  // Handle device editor save
  const handleDeviceEditorSave = (updatedDevice) => {
    topologyState.updateDevice(updatedDevice.id, {
      label: updatedDevice.label,
      ports: updatedDevice.ports
    });
    logEvent('DEVICE_UPDATE', `Updated device "${updatedDevice.label}" (${updatedDevice.ports.length} ports)`);
    setEditingDevice(null);
  };

  // Handle device editor cancel
  const handleDeviceEditorCancel = () => {
    setEditingDevice(null);
  };

  // Handle device editor delete
  const handleDeviceEditorDelete = (deviceId) => {
    const device = topologyState.topology.devices.find(d => d.id === deviceId);
    topologyState.removeDevice(deviceId);
    logEvent('DEVICE_DELETE', `Deleted device "${device?.label || deviceId}" from editor`);
    setEditingDevice(null);
  };

  // Handle connection editor save
  const handleConnectionEditorSave = (updatedConnection) => {
    topologyState.updateConnection(updatedConnection.id, {
      source: updatedConnection.source,
      target: updatedConnection.target,
      sourcePort: updatedConnection.sourcePort,
      targetPort: updatedConnection.targetPort,
      type: updatedConnection.type,
      label: updatedConnection.label
    });
    logEvent('CONNECTION_UPDATE', `Updated connection to ${updatedConnection.type}`);
    setEditingConnection(null);
  };

  // Handle connection editor cancel
  const handleConnectionEditorCancel = () => {
    setEditingConnection(null);
  };

  // Handle connection editor delete
  const handleConnectionEditorDelete = (connectionId) => {
    topologyState.removeConnection(connectionId);
    logEvent('CONNECTION_DELETE', `Deleted connection from editor`);
    setEditingConnection(null);
  };

  // Handle topology name change
  const handleNameChange = (newName) => {
    topologyState.setTopologyName(newName);
  };

  // Handle sidebar device selection
  const handleSidebarDeviceSelect = (device) => {
    setEditingDevice(device);
  };

  // Handle sidebar connection selection
  const handleSidebarConnectionSelect = (connection) => {
    setEditingConnection(connection);
  };

  // Handle device hover (from sidebar or canvas)
  const handleDeviceHover = (deviceId) => {
    setHighlightedDeviceId(deviceId);
    setHighlightedConnectionId(null);
  };

  // Handle connection hover (from sidebar or canvas)
  const handleConnectionHover = (connectionId) => {
    setHighlightedConnectionId(connectionId);
    setHighlightedDeviceId(null);
  };

  // Clear all highlights
  const handleClearHighlight = () => {
    setHighlightedDeviceId(null);
    setHighlightedConnectionId(null);
  };

  return (
    <TopologyContext.Provider value={{ ...topologyState, activeCanvas, setActiveCanvas }}>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1>Scamp Mapper</h1>
              <p className={styles.subtitle}>Device Topology Planning Tool</p>
            </div>
            <div className={styles.headerCenter}>
              <label htmlFor="setupName" className={styles.setupNameLabel}>Setup Name:</label>
              <input
                id="setupName"
                type="text"
                value={topologyState.topology.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={styles.setupNameInput}
                placeholder="Enter setup name"
              />
            </div>
            <div className={styles.headerButtons}>
              <button onClick={handleNew} className={styles.button}>New</button>
              <button onClick={handleImport} className={styles.button}>Open</button>
              <button onClick={handleExport} className={styles.button}>Save</button>
            </div>
          </div>
        </header>
        <Toolbar
          onAddDevice={handleAddDevice}
          showPortLabels={showPortLabels}
          onTogglePortLabels={handleTogglePortLabels}
        />
        <main className={styles.main}>
          <Sidebar
            topology={topologyState.topology}
            onDeviceSelect={handleSidebarDeviceSelect}
            onConnectionSelect={handleSidebarConnectionSelect}
            onDeviceHover={handleDeviceHover}
            onConnectionHover={handleConnectionHover}
            onClearHighlight={handleClearHighlight}
            highlightedDeviceId={highlightedDeviceId}
            highlightedConnectionId={highlightedConnectionId}
          />
          <div className={styles.canvasWrapper}>
            <TopologyCanvas
              topology={topologyState.topology}
              canvas={activeCanvas}
              onDeviceMove={handleDeviceMove}
              onDeviceDelete={handleDeviceDelete}
              onConnect={handleConnect}
              onEdgeDelete={handleEdgeDelete}
              onNodeDoubleClick={handleNodeDoubleClick}
              onEdgeDoubleClick={handleEdgeDoubleClick}
              onCanvasDrop={handleCanvasDrop}
              showPortLabels={showPortLabels}
              highlightedDeviceId={highlightedDeviceId}
              highlightedConnectionId={highlightedConnectionId}
              onNodeMouseEnter={handleDeviceHover}
              onNodeMouseLeave={handleClearHighlight}
              onEdgeMouseEnter={handleConnectionHover}
              onEdgeMouseLeave={handleClearHighlight}
            />
          </div>
        </main>
        <footer className={styles.footer}>
          <span>
            {topologyState.topology.devices.length} devices, {topologyState.topology.connections.length} connections | {topologyState.topology.name}
          </span>
        </footer>

        <EventLog events={events} />

        {editingDevice && (
          <DeviceEditor
            device={editingDevice}
            connections={topologyState.topology.connections}
            devices={topologyState.topology.devices}
            onSave={handleDeviceEditorSave}
            onCancel={handleDeviceEditorCancel}
            onDelete={handleDeviceEditorDelete}
          />
        )}

        {editingConnection && (
          <ConnectionEditor
            connection={editingConnection}
            devices={topologyState.topology.devices}
            onSave={handleConnectionEditorSave}
            onCancel={handleConnectionEditorCancel}
            onDelete={handleConnectionEditorDelete}
          />
        )}
      </div>
    </TopologyContext.Provider>
  );
}

export default App;
