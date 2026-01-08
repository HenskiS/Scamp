import { Handle, Position } from '@xyflow/react';
import baseStyles from './BaseNode.module.css';
import styles from './HubNode.module.css';

export default function HubNode({ data, selected }) {
  return (
    <div className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${styles.hubNode}`}>
      {/* Upstream port (input) on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="upstream"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />

      {/* Downstream ports (outputs) on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="downstream-1"
        className={baseStyles.handle}
        style={{ top: '20%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-1"
        className={baseStyles.handle}
        style={{ top: '35%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-2"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-3"
        className={baseStyles.handle}
        style={{ top: '65%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-4"
        className={baseStyles.handle}
        style={{ top: '80%' }}
      />

      {/* Node content */}
      <div className={baseStyles.nodeContent}>
        <div className={baseStyles.icon}>🔌</div>
        <div className={baseStyles.label}>{data.label}</div>
        <div className={baseStyles.type}>Hub</div>
      </div>
    </div>
  );
}
