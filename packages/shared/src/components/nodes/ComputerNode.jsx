import { Handle, Position } from '@xyflow/react';
import baseStyles from './BaseNode.module.css';
import styles from './ComputerNode.module.css';

export default function ComputerNode({ data, selected }) {
  return (
    <div className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${styles.computerNode}`}>
      {/* Thunderbolt ports on the left */}
      <Handle
        type="source"
        position={Position.Left}
        id="thunderbolt-1"
        className={baseStyles.handle}
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="thunderbolt-2"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="thunderbolt-3"
        className={baseStyles.handle}
        style={{ top: '70%' }}
      />

      {/* Thunderbolt ports on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="thunderbolt-4"
        className={baseStyles.handle}
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-c-1"
        className={baseStyles.handle}
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="usb-c-2"
        className={baseStyles.handle}
        style={{ top: '70%' }}
      />

      {/* Node content */}
      <div className={baseStyles.nodeContent}>
        <div className={baseStyles.icon}>💻</div>
        <div className={baseStyles.label}>{data.label}</div>
        <div className={baseStyles.type}>Computer</div>
      </div>
    </div>
  );
}
