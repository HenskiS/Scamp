import { useState } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar({
  topology,
  onDeviceSelect,
  onConnectionSelect,
  onDeviceHover,
  onConnectionHover,
  onClearHighlight,
  highlightedDeviceId,
  highlightedConnectionId
}) {
  const [activeTab, setActiveTab] = useState('devices'); // 'devices' or 'connections'

  const { devices = [], connections = [] } = topology || {};

  // Get device name by ID
  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.label || deviceId;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button
          className={`${styles.tab} ${activeTab === 'devices' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Devices ({devices.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'connections' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          Connections ({connections.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'devices' ? (
          <div className={styles.list}>
            {devices.length === 0 ? (
              <div className={styles.emptyState}>No devices yet</div>
            ) : (
              devices.map(device => (
                <div
                  key={device.id}
                  className={`${styles.listItem} ${highlightedDeviceId === device.id ? styles.highlighted : ''}`}
                  onClick={() => onDeviceSelect?.(device)}
                  onMouseEnter={() => onDeviceHover?.(device.id)}
                  onMouseLeave={() => onClearHighlight?.()}
                  title={`ID: ${device.id}`}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemLabel}>{device.label}</span>
                    <span className={styles.itemType}>{device.type}</span>
                  </div>
                  <div className={styles.itemDetails}>
                    <span className={styles.detailLabel}>Canvas:</span>
                    <span className={styles.detailValue}>{device.canvas}</span>
                    <span className={styles.detailLabel}>Ports:</span>
                    <span className={styles.detailValue}>{device.ports?.length || 0}</span>
                  </div>
                  {device.ports && device.ports.length > 0 && (
                    <div className={styles.portsList}>
                      {device.ports.map(port => (
                        <div key={port.id} className={styles.portItem}>
                          <span className={styles.portLabel}>{port.label}</span>
                          <span className={styles.portType}>{port.type}</span>
                          <span className={styles.portDirection}>{port.direction || 'bi'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {connections.length === 0 ? (
              <div className={styles.emptyState}>No connections yet</div>
            ) : (
              connections.map(conn => (
                <div
                  key={conn.id}
                  className={`${styles.listItem} ${highlightedConnectionId === conn.id ? styles.highlighted : ''}`}
                  onClick={() => onConnectionSelect?.(conn)}
                  onMouseEnter={() => onConnectionHover?.(conn.id)}
                  onMouseLeave={() => onClearHighlight?.()}
                  title={`ID: ${conn.id}`}
                >
                  <div className={styles.connectionHeader}>
                    <span className={styles.connectionType}>{conn.type.toUpperCase()}</span>
                    {conn.label && <span className={styles.connectionLabel}>"{conn.label}"</span>}
                  </div>
                  <div className={styles.connectionPath}>
                    <span className={styles.deviceName}>{getDeviceName(conn.source)}</span>
                    <span className={styles.portName}>[{conn.sourcePort}]</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.deviceName}>{getDeviceName(conn.target)}</span>
                    <span className={styles.portName}>[{conn.targetPort}]</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
