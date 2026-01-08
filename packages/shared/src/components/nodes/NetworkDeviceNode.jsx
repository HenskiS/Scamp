import { Handle, Position } from '@xyflow/react';
import baseStyles from './BaseNode.module.css';
import styles from './NetworkDeviceNode.module.css';

export default function NetworkDeviceNode({ data, selected }) {
  return (
    <div className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${styles.networkDeviceNode}`}>
      {/* USB port (input) on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="usb"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />

      {/* Ethernet port (output) on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="ethernet"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />

      {/* Node content */}
      <div className={baseStyles.nodeContent}>
        <div className={baseStyles.icon}>🌐</div>
        <div className={baseStyles.label}>{data.label}</div>
        <div className={baseStyles.type}>Network</div>
      </div>
    </div>
  );
}
