# Sample Topology Files

This directory contains example topology JSON files for testing Scamp Mapper.

## Files

### simple-setup.json
A basic Mac setup with:
- 1 Mac Studio
- 1 CalDigit TS4 hub
- 1 Studio Display
- 2 USB devices (keyboard and mouse)

All devices on the "current" canvas. Good for testing basic import/export functionality.

### rack-to-desk.json
A more complex scenario showing a rack-to-desk move with:
- Mac Studio with CalDigit TS4 hub
- 2 Studio Displays
- Audio interface, iLok, keyboard
- USB-to-Ethernet adapter
- Both "current" (rack) and "target" (desk) layouts

Demonstrates:
- Multiple devices and connections
- Dual canvas setup (current vs. target)
- Different connection types (Thunderbolt, USB)
- Display daisy-chaining in target layout

## Usage

1. Open Scamp Mapper
2. Click "Open" button
3. Select a sample file
4. Explore the topology on the canvas

You can also use these as templates for creating your own topology files.
