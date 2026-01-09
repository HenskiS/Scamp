import { useState } from 'react';
import { CONNECTION_TYPES, PORT_POSITIONS, PORT_DIRECTIONS, createPort } from '@scamp/shared';
import styles from './DeviceEditor.module.css';

export default function DeviceEditor({ device, connections, devices, connectionTypes, onSave, onCancel, onDelete }) {
  const [label, setLabel] = useState(device.label);
  const [ports, setPorts] = useState([...device.ports]);
  const [style, setStyle] = useState(device.style || {});

  // Use dynamic connection types or fall back to hardcoded ones
  let availableConnectionTypes = connectionTypes || Object.values(CONNECTION_TYPES).map(id => ({ id, name: id.toUpperCase() }));

  // Add any missing types that are used in the device's ports but not in the list
  // (This handles cases where a type was deleted or the topology is from an old version)
  const usedTypes = new Set(ports.map(p => p.type));
  const availableTypeIds = new Set(availableConnectionTypes.map(ct => ct.id));
  const missingTypes = Array.from(usedTypes).filter(typeId => !availableTypeIds.has(typeId));

  if (missingTypes.length > 0) {
    const missingTypeObjects = missingTypes.map(typeId => ({
      id: typeId,
      name: `${typeId.toUpperCase()} (missing)`
    }));
    availableConnectionTypes = [...availableConnectionTypes, ...missingTypeObjects];
  }

  // Find connections that involve this device
  const deviceConnections = connections?.filter(
    conn => conn.source === device.id || conn.target === device.id
  ) || [];

  // Get device name by ID
  const getDeviceName = (deviceId) => {
    const dev = devices?.find(d => d.id === deviceId);
    return dev?.label || deviceId;
  };

  // Get connection type name by ID
  const getConnectionTypeName = (typeId) => {
    const ct = availableConnectionTypes.find(type => type.id === typeId);
    return ct ? ct.name : typeId.toUpperCase();
  };

  const handleAddPort = () => {
    const newPort = createPort({
      label: `Port ${ports.length + 1}`,
      type: CONNECTION_TYPES.USB,
      position: PORT_POSITIONS.RIGHT
    });
    setPorts([...ports, newPort]);
  };

  const handleRemovePort = (index) => {
    setPorts(ports.filter((_, i) => i !== index));
  };

  const handlePortChange = (index, field, value) => {
    const updatedPorts = [...ports];
    updatedPorts[index] = { ...updatedPorts[index], [field]: value };
    setPorts(updatedPorts);
  };

  const handleSave = () => {
    // Validate port labels are unique
    const portLabels = ports.map(p => p.label);
    const duplicates = portLabels.filter((label, index) => portLabels.indexOf(label) !== index);

    if (duplicates.length > 0) {
      alert(`Port labels must be unique. Duplicate found: ${duplicates.join(', ')}`);
      return;
    }

    // Validate port IDs are unique (shouldn't happen, but check anyway)
    const portIds = ports.map(p => p.id);
    const duplicateIds = portIds.filter((id, index) => portIds.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      alert(`Internal error: Duplicate port IDs detected. Please recreate these ports.`);
      return;
    }

    onSave({
      ...device,
      label,
      ports,
      style
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete ${device.label}? This action cannot be undone.`)) {
      onDelete(device.id);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Edit Device</h2>
          <button onClick={onCancel} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label>Device Name:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>Device Type:</label>
            <span className={styles.readOnly}>{device.type}</span>
          </div>

          {device.type === 'text-label' && (
            <>
              <div className={styles.field}>
                <label htmlFor="font-size">Font Size:</label>
                <select
                  id="font-size"
                  value={style.fontSize || '16px'}
                  onChange={(e) => setStyle({ ...style, fontSize: e.target.value })}
                  className={styles.input}
                >
                  <option value="12px">Small (12px)</option>
                  <option value="16px">Medium (16px)</option>
                  <option value="20px">Large (20px)</option>
                  <option value="24px">Extra Large (24px)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="text-color">Text Color:</label>
                <input
                  id="text-color"
                  type="color"
                  value={style.color || '#000000'}
                  onChange={(e) => setStyle({ ...style, color: e.target.value })}
                  className={styles.colorInput}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="bg-color">Background Color:</label>
                <input
                  id="bg-color"
                  type="color"
                  value={style.backgroundColor || '#ffff99'}
                  onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                  className={styles.colorInput}
                />
              </div>
            </>
          )}

          <div className={styles.portsSection}>
            <div className={styles.portsHeader}>
              <label>Ports:</label>
              <button onClick={handleAddPort} className={styles.addButton}>
                + Add Port
              </button>
            </div>

            <div className={styles.portsList}>
              {ports.map((port, index) => (
                <div key={port.id} className={styles.portRow}>
                  <input
                    type="text"
                    value={port.label}
                    onChange={(e) => handlePortChange(index, 'label', e.target.value)}
                    className={styles.portInput}
                    placeholder="Port label"
                  />
                  <select
                    value={port.type}
                    onChange={(e) => handlePortChange(index, 'type', e.target.value)}
                    className={styles.portSelect}
                  >
                    {availableConnectionTypes.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                  <select
                    value={port.position}
                    onChange={(e) => handlePortChange(index, 'position', e.target.value)}
                    className={styles.portSelect}
                  >
                    {Object.values(PORT_POSITIONS).map(pos => (
                      <option key={pos} value={pos}>{pos.toUpperCase()}</option>
                    ))}
                  </select>
                  <select
                    value={port.direction || PORT_DIRECTIONS.BIDIRECTIONAL}
                    onChange={(e) => handlePortChange(index, 'direction', e.target.value)}
                    className={styles.portSelect}
                    title="Port direction"
                  >
                    {Object.values(PORT_DIRECTIONS).map(dir => (
                      <option key={dir} value={dir}>{dir.toUpperCase()}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemovePort(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {deviceConnections.length > 0 && (
            <div className={styles.connectionsSection}>
              <label>Connections ({deviceConnections.length}):</label>
              <div className={styles.connectionsList}>
                {deviceConnections.map(conn => {
                  const isSource = conn.source === device.id;
                  const otherDeviceId = isSource ? conn.target : conn.source;
                  const otherDeviceName = getDeviceName(otherDeviceId);
                  const direction = isSource ? '→' : '←';

                  return (
                    <div key={conn.id} className={styles.connectionItem}>
                      <span className={styles.connectionType}>{getConnectionTypeName(conn.type)}</span>
                      <span className={styles.connectionDetail}>
                        {direction} {otherDeviceName}
                      </span>
                      {conn.label && <span className={styles.connectionLabel}>"{conn.label}"</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={handleDelete} className={styles.deleteButton}>Delete Device</button>
          <div className={styles.footerRight}>
            <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
