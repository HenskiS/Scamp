#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { getAllProfilerData } from './src/profiler.js';
import { parseProfilerData } from './src/parser.js';
import { mapToTopology } from './src/mapper.js';
import { calculateLayout } from './src/layout.js';
import { validateTopology } from '@scamp/shared/utils';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    output: null,
    name: null,
    fromFiles: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      options.output = args[++i];
    } else if (args[i] === '--name' || args[i] === '-n') {
      options.name = args[++i];
    } else if (args[i] === '--from-files' || args[i] === '-f') {
      options.fromFiles = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Scamp Scanner - macOS Device Topology Scanner

Usage: node cli.js [options]

Options:
  -o, --output <filename>   Output filename (default: topology-{timestamp}.json)
  -n, --name <name>         Setup name (default: "Scanned Setup {date}")
  -f, --from-files          Load from dad-*.json files instead of running system_profiler
  -h, --help               Show this help message

Examples:
  node cli.js
  node cli.js --output my-setup.json
  node cli.js --name "Office Setup" --output office.json
  node cli.js --from-files --name "Dad's Mac Studio"
      `);
      process.exit(0);
    }
  }

  return options;
}

/**
 * Main execution
 */
async function main() {
  try {
    const options = parseArgs();

    // Step 1: Run system_profiler commands (or load from files)
    console.log(options.fromFiles ? '\n📁 Loading device data from files...\n' : '\n🔍 Scanning Mac devices...\n');
    const profilerData = getAllProfilerData({ fromFiles: options.fromFiles });

    // Step 2: Parse the data
    console.log('📊 Parsing device data...\n');
    const parsedData = parseProfilerData(profilerData);

    if (parsedData.devices.length === 0) {
      console.log('⚠️  No devices found.');
      process.exit(1);
    }

    // Step 3: Calculate layout
    console.log('📐 Calculating layout...\n');
    const positions = calculateLayout(parsedData.devices, parsedData.connections);

    // Step 4: Map to topology format
    const setupName = options.name || `Scanned Setup ${new Date().toLocaleDateString()}`;
    console.log(`🗺️  Creating topology: "${setupName}"...\n`);
    const topology = mapToTopology(parsedData, positions, setupName);

    // Step 5: Validate topology
    console.log('✅ Validating topology...\n');
    const validation = validateTopology(topology);
    if (!validation.valid) {
      console.error('❌ Topology validation failed:');
      console.error(validation.errors);
      process.exit(1);
    }

    // Step 6: Generate output filename
    const timestamp = Date.now().toString(36);
    const filename = options.output || `topology-${timestamp}.json`;

    // Step 7: Write to file
    console.log(`💾 Writing to file: ${filename}...\n`);
    writeFileSync(filename, JSON.stringify(topology, null, 2), 'utf8');

    // Step 8: Success!
    console.log('✨ Scan complete!\n');
    console.log(`📄 Generated: ${filename}`);
    console.log(`📊 Devices: ${topology.devices.length}`);
    console.log(`🔗 Connections: ${topology.connections.length}`);
    console.log('\n💡 Import this file in Mapper with File > Open\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
