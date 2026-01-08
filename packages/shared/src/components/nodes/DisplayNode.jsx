import { Handle, Position } from '@xyflow/react';
import baseStyles from './BaseNode.module.css';
import styles from './DisplayNode.module.css';

export default function DisplayNode({ data, selected }) {
  return (
    <div className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${styles.displayNode}`}>
      {/* Upstream port (input) on top */}
      <Handle
        type="target"
        position={Position.Top}
        id="upstream"
        className={baseStyles.handle}
        style={{ left: '50%' }}
      />

      {/* Downstream port (output for daisy-chaining) on bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="downstream"
        className={baseStyles.handle}
        style={{ left: '50%' }}
      />

      {/* Node content */}
      <div className={baseStyles.nodeContent}>
        <div className={baseStyles.icon}>🖥️</div>
        <div className={baseStyles.label}>{data.label}</div>
        <div className={baseStyles.type}>Display</div>
      </div>
    </div>
  );
}
