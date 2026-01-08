/**
 * Calculate positions for devices using hierarchical circular layout
 * @param {Array} devices - Array of parsed devices with depth property
 * @param {Array} connections - Array of connections
 * @returns {Object} Map of { deviceId: {x, y} }
 */
export function calculateLayout(devices, connections) {
  const positions = {};

  // Radius for each depth level
  const radiusPerDepth = {
    0: 0,      // Computer at center
    1: 300,    // Direct connections
    2: 600,    // Second level
    3: 900,    // Third level and beyond
  };

  // Group devices by depth
  const devicesByDepth = {};
  for (const device of devices) {
    const depth = device.depth || 0;
    if (!devicesByDepth[depth]) {
      devicesByDepth[depth] = [];
    }
    devicesByDepth[depth].push(device);
  }

  // Position devices at each depth level
  for (const [depthStr, devicesAtDepth] of Object.entries(devicesByDepth)) {
    const depth = parseInt(depthStr);
    const radius = radiusPerDepth[depth] || radiusPerDepth[3];

    if (depth === 0) {
      // Computer at center
      for (const device of devicesAtDepth) {
        positions[device.detectionId] = { x: 0, y: 0 };
      }
    } else {
      // Distribute evenly around circle
      const count = devicesAtDepth.length;
      const angleStep = (2 * Math.PI) / count;

      devicesAtDepth.forEach((device, index) => {
        // Start from top (-90 degrees) and go clockwise
        const angle = -Math.PI / 2 + angleStep * index;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        positions[device.detectionId] = {
          x: Math.round(x * 10) / 10, // Round to 1 decimal
          y: Math.round(y * 10) / 10,
        };
      });
    }
  }

  return positions;
}

/**
 * Calculate layout with connection-aware positioning
 * Attempts to position connected devices near each other
 * @param {Array} devices - Array of parsed devices
 * @param {Array} connections - Array of connections
 * @returns {Object} Map of { deviceId: {x, y} }
 */
export function calculateSmartLayout(devices, connections) {
  // For now, use the hierarchical layout
  // Future enhancement: cluster connected devices
  return calculateLayout(devices, connections);
}
