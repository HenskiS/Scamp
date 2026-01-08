import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

/**
 * Run a system_profiler command and return parsed JSON
 * @param {string} dataType - The SPDataType to query (e.g., 'SPUSBDataType')
 * @returns {Object|null} Parsed JSON or null on error
 */
function runProfilerCommand(dataType) {
  try {
    const output = execSync(`system_profiler ${dataType} -json`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });
    return JSON.parse(output);
  } catch (error) {
    console.error(`Warning: Failed to run system_profiler ${dataType}: ${error.message}`);
    return null;
  }
}

/**
 * Load profiler data from a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON or null on error
 */
function loadProfilerFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return null;
    }
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Warning: Failed to load ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Get USB device data
 * @returns {Object|null} USB data or null on error
 */
export function getUSBData() {
  return runProfilerCommand('SPUSBDataType');
}

/**
 * Get Thunderbolt device data
 * @returns {Object|null} Thunderbolt data or null on error
 */
export function getThunderboltData() {
  return runProfilerCommand('SPThunderboltDataType');
}

/**
 * Get display data
 * @returns {Object|null} Display data or null on error
 */
export function getDisplayData() {
  return runProfilerCommand('SPDisplaysDataType');
}

/**
 * Get network data
 * @returns {Object|null} Network data or null on error
 */
export function getNetworkData() {
  return runProfilerCommand('SPNetworkDataType');
}

/**
 * Run all system_profiler commands and return combined data
 * @param {Object} options - Options for data collection
 * @param {boolean} options.fromFiles - Load from JSON files instead of running system_profiler
 * @returns {Object} Object containing all profiler data
 */
export function getAllProfilerData(options = {}) {
  if (options.fromFiles) {
    console.log('Loading Mac device data from files...');
    return {
      usb: loadProfilerFile('dad-usb.json'),
      thunderbolt: loadProfilerFile('dad-thunderbolt.json'),
      displays: loadProfilerFile('dad-displays.json'),
      network: loadProfilerFile('dad-network.json'),
    };
  }

  console.log('Scanning Mac devices...');

  const usbData = getUSBData();
  const thunderboltData = getThunderboltData();
  const displayData = getDisplayData();
  const networkData = getNetworkData();

  return {
    usb: usbData,
    thunderbolt: thunderboltData,
    displays: displayData,
    network: networkData,
  };
}
