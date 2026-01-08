import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PORT_POSITIONS, CONNECTION_TYPES, PORT_DIRECTIONS } from '../../utils/fileFormat.js';
import baseStyles from './BaseNode.module.css';
import styles from './DynamicDeviceNode.module.css';

// Map port position to React Flow Position
const positionMap = {
  [PORT_POSITIONS.LEFT]: Position.Left,
  [PORT_POSITIONS.RIGHT]: Position.Right,
  [PORT_POSITIONS.TOP]: Position.Top,
  [PORT_POSITIONS.BOTTOM]: Position.Bottom
};

// Get icon for device type
const getDeviceIcon = (type) => {
  const icons = {
    'computer': '💻',
    'hub': '🔌',
    'display': '🖥️',
    'usb-device': '⌨️',
    'network-device': '🌐',
    'thunderbolt-device': '⚡',
    'adapter': '🔄'
  };
  return icons[type] || '📦';
};

// Get color for device type
const getDeviceColor = (type) => {
  const colors = {
    'computer': 'var(--color-connection-thunderbolt, #f4c430)',
    'hub': 'var(--color-connection-usb, #4169e1)',
    'display': 'var(--color-connection-displayport, #9370db)',
    'usb-device': 'var(--color-connection-usb, #4169e1)',
    'network-device': 'var(--color-connection-ethernet, #32cd32)',
    'thunderbolt-device': 'var(--color-connection-thunderbolt, #f4c430)',
    'adapter': 'var(--color-border-dark, #999999)'
  };
  return colors[type] || 'var(--color-border-dark, #999999)';
};

// Get color for port type
const getPortColor = (portType) => {
  const colors = {
    [CONNECTION_TYPES.USB]: 'var(--color-connection-usb, #4169e1)',
    [CONNECTION_TYPES.THUNDERBOLT]: 'var(--color-connection-thunderbolt, #f4c430)',
    [CONNECTION_TYPES.ETHERNET]: 'var(--color-connection-ethernet, #32cd32)',
    [CONNECTION_TYPES.DISPLAYPORT]: 'var(--color-connection-displayport, #9370db)',
    [CONNECTION_TYPES.HDMI]: 'var(--color-connection-hdmi, #ff6347)'
  };
  return colors[portType] || '#888888';
};

export default function DynamicDeviceNode({ data, selected }) {
  const { label, deviceType, ports = [], showPortLabels = true, highlighted = false } = data;

  // Group ports by position
  const portsByPosition = ports.reduce((acc, port) => {
    if (!acc[port.position]) acc[port.position] = [];
    acc[port.position].push(port);
    return acc;
  }, {});

  // Calculate port offset based on count and index
  const getPortStyle = (position, index, total) => {
    const spacing = 100 / (total + 1);
    const offset = spacing * (index + 1);

    if (position === PORT_POSITIONS.LEFT || position === PORT_POSITIONS.RIGHT) {
      return { top: `${offset}%` };
    } else {
      return { left: `${offset}%` };
    }
  };

  const borderColor = getDeviceColor(deviceType);
  const isAdapter = deviceType === 'adapter';
  const nodeClassName = isAdapter ? styles.adapterNode : styles.dynamicNode;

  return (
    <div
      className={`${baseStyles.node} ${selected ? baseStyles.selected : ''} ${nodeClassName} ${highlighted ? styles.highlighted : ''}`}
      style={{ borderColor, borderWidth: deviceType === 'computer' ? '3px' : '2px' }}
    >
      {/* Render ports dynamically - each port gets both source and target handles for bidirectional connections */}
      {ports.map((port, index) => {
        const position = positionMap[port.position] || Position.Left;
        const portsInPosition = ports.filter(p => p.position === port.position);
        const portIndex = portsInPosition.indexOf(port);
        const style = getPortStyle(port.position, portIndex, portsInPosition.length);
        const portColor = getPortColor(port.type);

        // Combine style with color
        const handleStyle = {
          ...style,
          backgroundColor: portColor,
          border: `2px solid ${portColor}`,
          width: '14px',
          height: '14px'
        };

        // Determine which handles to render based on direction (default: bidirectional)
        const direction = port.direction || PORT_DIRECTIONS.BIDIRECTIONAL;
        const shouldRenderSource = direction === PORT_DIRECTIONS.OUT || direction === PORT_DIRECTIONS.BIDIRECTIONAL;
        const shouldRenderTarget = direction === PORT_DIRECTIONS.IN || direction === PORT_DIRECTIONS.BIDIRECTIONAL;

        // Add direction class for visual indicators
        const directionClass = direction === PORT_DIRECTIONS.IN ? styles.portIn :
                               direction === PORT_DIRECTIONS.OUT ? styles.portOut :
                               styles.portBidirectional;

        return (
          <React.Fragment key={port.id}>
            {shouldRenderSource && (
              <Handle
                type="source"
                position={position}
                id={port.id}
                className={`${baseStyles.handle} ${directionClass}`}
                style={handleStyle}
                data-direction={direction}
                data-port-position={port.position}
              />
            )}
            {shouldRenderTarget && (
              <Handle
                type="target"
                position={position}
                id={port.id}
                className={`${baseStyles.handle} ${directionClass}`}
                style={handleStyle}
                data-direction={direction}
                data-port-position={port.position}
              />
            )}
            {/* Port label */}
            {showPortLabels && (
              <div
                className={styles.portLabel}
                style={style}
                data-position={port.position}
              >
                {port.label}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Node content */}
      <div className={baseStyles.nodeContent} style={isAdapter ? { padding: '6px' } : undefined}>
        <div className={baseStyles.icon} style={isAdapter ? { fontSize: '18px' } : undefined}>{getDeviceIcon(deviceType)}</div>
        <div className={baseStyles.label} style={isAdapter ? { fontSize: '11px' } : undefined}>{label}</div>
        <div className={baseStyles.type} style={isAdapter ? { fontSize: '9px' } : undefined}>{deviceType}</div>
      </div>
    </div>
  );
}
