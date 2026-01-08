import { useCallback } from 'react';
import { parseTopologyFile, stringifyTopology } from '../utils/fileFormat.js';

/**
 * Custom hook for handling file import/export operations
 * Works with browser File API for JSON topology files
 */
export function useFileIO() {
  // Import topology from a JSON file
  const importTopology = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const text = await file.text();
          const result = parseTopologyFile(text);

          if (result.success) {
            resolve({
              topology: result.topology,
              filename: file.name
            });
          } else {
            reject(new Error(`${result.error}: ${result.details.join(', ')}`));
          }
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new Error('File selection cancelled'));
      };

      // Trigger file picker
      input.click();
    });
  }, []);

  // Export topology to a JSON file
  const exportTopology = useCallback(async (topology, filename = null) => {
    try {
      // Generate filename if not provided
      const defaultFilename = `${topology.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      const finalFilename = filename || defaultFilename;

      // Convert topology to JSON string
      const jsonString = stringifyTopology(topology);

      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also save to samples folder (in dev mode only)
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: finalFilename,
            content: jsonString
          })
        });
        console.log(`✅ Saved to samples/${finalFilename}`);
      } catch (apiError) {
        // Silently fail if API not available (production mode)
        console.log('Note: File not saved to samples folder (dev mode only)');
      }

      return { success: true, filename: finalFilename };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // Load topology from JSON string (useful for examples/samples)
  const loadFromString = useCallback((jsonString) => {
    const result = parseTopologyFile(jsonString);
    return result;
  }, []);

  return {
    importTopology,
    exportTopology,
    loadFromString
  };
}
