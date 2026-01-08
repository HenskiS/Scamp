import { DEVICE_TYPES } from '@scamp/shared';
import styles from './Toolbar.module.css';

export default function Toolbar({ onAddDevice, showPortLabels, onTogglePortLabels }) {
  const deviceTypes = [
    { type: DEVICE_TYPES.COMPUTER, label: 'Computer', icon: '💻' },
    { type: DEVICE_TYPES.HUB, label: 'Hub', icon: '🔌' },
    { type: DEVICE_TYPES.DISPLAY, label: 'Display', icon: '🖥️' },
    { type: DEVICE_TYPES.USB_DEVICE, label: 'USB Device', icon: '⌨️' },
    { type: DEVICE_TYPES.NETWORK_DEVICE, label: 'Network', icon: '🌐' },
    { type: DEVICE_TYPES.ADAPTER, label: 'Adapter', icon: '🔄' }
  ];

  const handleDragStart = (event, deviceType) => {
    event.dataTransfer.setData('application/reactflow', deviceType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Add Device:</span>
        {deviceTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onAddDevice(type)}
            onDragStart={(e) => handleDragStart(e, type)}
            draggable
            className={styles.toolbarButton}
            title={`Click to add at random position, or drag onto canvas`}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
      <div className={styles.rightSection}>
        <button
          onClick={onTogglePortLabels}
          className={styles.toggleButton}
          title={showPortLabels ? 'Hide port labels' : 'Show port labels'}
        >
          🏷️ {showPortLabels ? 'Port Labels On' : 'Port Labels Off'}
        </button>
      </div>
    </div>
  );
}
