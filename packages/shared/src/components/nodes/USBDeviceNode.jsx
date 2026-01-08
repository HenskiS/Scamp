import { Handle, Position } from '@xyflow/react';
import baseStyles from './BaseNode.module.css';
import styles from './USBDeviceNode.module.css';

export default function USBDeviceNode({ data, selected }) {
  return (
    <div className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${styles.usbDeviceNode}`}>
      {/* USB port (input) on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="usb"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />

      {/* Node content */}
      <div className={baseStyles.nodeContent}>
        <div className={baseStyles.icon}>⌨️</div>
        <div className={baseStyles.label}>{data.label}</div>
        <div className={baseStyles.type}>USB Device</div>
      </div>
    </div>
  );
}
