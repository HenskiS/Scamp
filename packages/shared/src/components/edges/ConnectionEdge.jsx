import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position } from '@xyflow/react';
import styles from './ConnectionEdge.module.css';

export default function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {}
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { connectionType, label, sourcePort, targetPort, highlighted = false } = data;

  // Calculate offset for port labels to avoid overlapping with nodes
  const getPortLabelOffset = (position) => {
    const offset = 25; // Distance from connection point
    switch (position) {
      case Position.Left:
        return { x: offset, y: 0 };
      case Position.Right:
        return { x: -offset, y: 0 };
      case Position.Top:
        return { x: 0, y: offset };
      case Position.Bottom:
        return { x: 0, y: -offset };
      default:
        return { x: 0, y: 0 };
    }
  };

  const sourceOffset = getPortLabelOffset(sourcePosition);
  const targetOffset = getPortLabelOffset(targetPosition);

  // Add dashed line for animation (animation defined in CSS)
  const animatedStyle = {
    ...style,
    strokeDasharray: '8 4',
    strokeWidth: highlighted ? 4 : 2
  };

  const edgeClassName = `${styles.animatedEdge} ${highlighted ? styles.highlighted : ''}`;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={animatedStyle} className={edgeClassName} />

      <EdgeLabelRenderer>
        {/* Connection type and custom label */}
        {(label || connectionType) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={styles.edgeLabel}
          >
            <div className={styles.labelContent}>
              {label && <span className={styles.customLabel}>{label}</span>}
              {connectionType && (
                <span className={styles.connectionType}>{connectionType.toUpperCase()}</span>
              )}
            </div>
          </div>
        )}

        {/* Source port label */}
        {sourcePort && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + sourceOffset.x}px,${sourceY + sourceOffset.y}px)`,
              pointerEvents: 'none',
            }}
            className={styles.portLabel}
          >
            {sourcePort}
          </div>
        )}

        {/* Target port label */}
        {targetPort && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + targetOffset.x}px,${targetY + targetOffset.y}px)`,
              pointerEvents: 'none',
            }}
            className={styles.portLabel}
          >
            {targetPort}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
