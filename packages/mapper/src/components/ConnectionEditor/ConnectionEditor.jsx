import { useState } from 'react';
import { CONNECTION_TYPES } from '@scamp/shared';
import styles from './ConnectionEditor.module.css';

export default function ConnectionEditor({ connection, devices, connectionTypes, onSave, onCancel, onDelete }) {
  const [type, setType] = useState(connection.type);
  const [label, setLabel] = useState(connection.label || '');
  const [sourceId, setSourceId] = useState(connection.source);
  const [targetId, setTargetId] = useState(connection.target);
  const [sourcePortId, setSourcePortId] = useState(connection.sourcePort);
  const [targetPortId, setTargetPortId] = useState(connection.targetPort);

  // Use dynamic connection types or fall back to hardcoded ones
  let availableConnectionTypes = connectionTypes || Object.values(CONNECTION_TYPES).map(id => ({ id, name: id.toUpperCase() }));

  // Add the connection's current type if it's not in the list
  // (This handles cases where a type was deleted or the topology is from an old version)
  const hasCurrentType = availableConnectionTypes.some(ct => ct.id === type);
  if (!hasCurrentType && type) {
    availableConnectionTypes = [
      ...availableConnectionTypes,
      { id: type, name: `${type.toUpperCase()} (missing)` }
    ];
  }

  // Find source and target devices
  const sourceDevice = devices.find(d => d.id === sourceId);
  const targetDevice = devices.find(d => d.id === targetId);

  // Get available ports for source and target
  const sourcePorts = sourceDevice?.ports || [];
  const targetPorts = targetDevice?.ports || [];

  const handleSave = () => {
    onSave({
      ...connection,
      source: sourceId,
      target: targetId,
      sourcePort: sourcePortId,
      targetPort: targetPortId,
      type,
      label
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete connection? This action cannot be undone.`)) {
      onDelete(connection.id);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Edit Connection</h2>
          <button onClick={onCancel} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label>Source Device:</label>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                // Reset port selection when device changes
                const newDevice = devices.find(d => d.id === e.target.value);
                if (newDevice?.ports?.length > 0) {
                  setSourcePortId(newDevice.ports[0].id);
                }
              }}
              className={styles.select}
            >
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Source Port:</label>
            <select
              value={sourcePortId}
              onChange={(e) => setSourcePortId(e.target.value)}
              className={styles.select}
              disabled={sourcePorts.length === 0}
            >
              {sourcePorts.map(port => (
                <option key={port.id} value={port.id}>{port.label} ({port.type})</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Target Device:</label>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                // Reset port selection when device changes
                const newDevice = devices.find(d => d.id === e.target.value);
                if (newDevice?.ports?.length > 0) {
                  setTargetPortId(newDevice.ports[0].id);
                }
              }}
              className={styles.select}
            >
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Target Port:</label>
            <select
              value={targetPortId}
              onChange={(e) => setTargetPortId(e.target.value)}
              className={styles.select}
              disabled={targetPorts.length === 0}
            >
              {targetPorts.map(port => (
                <option key={port.id} value={port.id}>{port.label} ({port.type})</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Connection Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.select}
            >
              {availableConnectionTypes.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Label (optional):</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={styles.input}
              placeholder="e.g., Primary Display"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handleDelete} className={styles.deleteButton}>Delete Connection</button>
          <div className={styles.footerRight}>
            <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
