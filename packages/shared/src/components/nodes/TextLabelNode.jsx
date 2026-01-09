import React from 'react';
import styles from './TextLabelNode.module.css';
import baseStyles from './BaseNode.module.css';

export default function TextLabelNode({ data, selected }) {
  const { label, highlighted = false, style = {} } = data;

  // Default styles
  const defaultStyle = {
    fontSize: '16px',
    color: '#000000',
    backgroundColor: 'rgba(255, 255, 200, 0.9)',
    fontWeight: 'bold'
  };

  // Merge custom styles with defaults
  const mergedStyle = { ...defaultStyle, ...style };

  const nodeClassName = `${styles.textLabelNode} ${
    selected ? baseStyles.selected : ''
  } ${highlighted ? baseStyles.highlighted : ''}`;

  return (
    <div
      className={nodeClassName}
      style={{
        fontSize: mergedStyle.fontSize,
        color: mergedStyle.color,
        backgroundColor: mergedStyle.backgroundColor,
        fontWeight: mergedStyle.fontWeight
      }}
    >
      <div className={styles.textContent}>
        {label}
      </div>
    </div>
  );
}
