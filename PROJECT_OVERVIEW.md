# Scamp - Mac Device Topology Mapper

## Project Overview
A tool suite for mapping, planning, and verifying complex Mac peripheral setups during physical moves or upgrades. Built to handle USB, Thunderbolt, Ethernet, displays, and hubs with port-level connection tracking.

## The Problem
Moving a Mac with many interconnected peripherals (monitors, USB-over-Ethernet, expansion hubs, iLoks, audio interfaces, etc.) from one location to another risks missing connections or plugging things into wrong ports. Need to document current state, plan new layout, and verify everything reconnects correctly.

## The Solution: Two Tools, One Codebase

### Scanner (Mac-only)
- Node/Express backend that polls `system_profiler` for device detection
- React frontend with live device monitoring
- Shows real-time connection status (green/red indicators)
- Export topology files for planning

### Mapper (Cross-platform)
- Static React app, no backend required
- Pure diagramming/planning tool
- Import/export topology files
- Use while Mac is disconnected

### Shared Package
- React Flow-based canvas components
- Device node components
- Connection drawing logic
- File format utilities
- Data structures

## Architecture

### Monorepo Structure
```
scamp/
├── packages/
│   ├── shared/          # Shared React components & logic
│   ├── mapper/          # Static planning app
│   └── scanner/         # Full app with Node backend
│       ├── server/      # Express API
│       └── client/      # React frontend
```

### Tech Stack
- **Frontend:** React + React Flow
- **Backend (Scanner only):** Node.js + Express
- **Device Detection:** macOS `system_profiler` commands
- **Data Format:** JSON topology files
- **Package Management:** npm workspaces

## Key Features

### Visual Diagramming
- Drag devices around 2D canvas to match physical layout
- Draw connections between devices
- Label ports (e.g., "Thunderbolt 1", "USB Port 3")
- Custom device names/labels
- Save/load layouts

### Device Detection (Scanner only)
- Detect USB devices and hubs
- Detect Thunderbolt devices
- Detect network/Ethernet devices
- Detect displays
- Show device hierarchies (what's plugged into hubs)

### Live Monitoring Mode
- **Live Delta View:** Real-time color-coded status
  - 🟢 Just connected (< 5 seconds)
  - 🔴 Just disconnected (< 5 seconds)  
  - ⚪ Stable/unchanged
- **Event Log Panel:** Scrollable log at bottom
  - Timestamps for all connection changes
  - Exportable for documentation
- **Snapshot Comparison:** Save states and compare

### Two Canvas Views
- **Current Setup:** Document existing rack layout
- **Target Setup:** Plan new desk arrangement
- Toggle between views
- Side panel shows missing/disconnected devices

### File Format
```json
{
  "version": "1.0",
  "name": "Dad's Desk Setup",
  "devices": [
    {
      "id": "mac-main",
      "type": "computer",
      "label": "Mac Studio",
      "detectionId": "system-id-xyz",
      "position": { "x": 100, "y": 100 },
      "canvas": "current"
    },
    {
      "id": "hub-1",
      "type": "hub",
      "label": "CalDigit TS4",
      "detectionId": "usb-hub-abc",
      "position": { "x": 300, "y": 100 }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "mac-main",
      "target": "hub-1",
      "sourcePort": "thunderbolt-1",
      "targetPort": "upstream",
      "type": "thunderbolt",
      "label": "TB4"
    }
  ]
}
```

## Workflow

### Phase 1: Document Current State
1. Run Scanner on Mac in rack
2. Auto-detect all devices via system_profiler
3. Arrange devices on canvas to match physical layout
4. Draw connections, label ports
5. Export `rack-setup.json`

### Phase 2: Plan New Layout
1. Unplug Mac to move
2. Open Mapper on laptop/other device
3. Import `rack-setup.json`
4. Rearrange devices for desk layout
5. Export `desk-plan.json`

### Phase 3: Execute Move & Verify
1. Move equipment to desk
2. Run Scanner on Mac
3. Import `desk-plan.json`
4. Start Live Monitoring mode
5. Reconnect devices while watching live status
6. Use checklist sidebar to track what's missing
7. Export log for documentation

### Bonus: Mac Upgrade
1. Export peripherals from old Mac
2. Import into Scanner on new Mac
3. Verify all peripherals reconnect correctly

## UI Design Philosophy

**Old-School Utility Aesthetic:**
- Functional over fancy (WinSCP, DB Browser style)
- Dense information display
- Monospace fonts for logs/IDs
- Simple borders and panels
- Resizable splitter panels
- Clear toolbar with mode indicators
- Status bar showing connection state
- No unnecessary animations or gradients

**Layout:**
- Menu bar (File, View, Tools, Help)
- Toolbar with action buttons
- Left panel: Device tree list
- Center: React Flow canvas
- Bottom panel: Scrollable event log
- Status bar: Connection count, scanning status

## Development Plan

### Build Order
1. **Shared package first:** Canvas, device nodes, file I/O
2. **Mapper:** Static app using shared components
3. **Scanner backend:** Express server with system_profiler integration
4. **Scanner frontend:** Add live monitoring to shared canvas
5. **Polish:** Logging, status indicators, export features

### Start on Windows
- Build Mapper and shared components
- Test file import/export
- Perfect the diagramming UX

### Switch to Mac
- Build Scanner backend
- Test device detection
- Integrate live monitoring
- Test full workflow

## Why Build This?

**No existing solution does this because:**
- USB mapping tools (USBMap, Hackintool) only handle USB for Hackintosh port limits
- Network mapping tools focus on IP devices, not personal peripherals
- Cable management software is enterprise/industrial focused
- Diagramming tools (Lucidchart) have no device detection
- Nothing combines spatial planning + live device monitoring + peripheral variety (USB/TB/Ethernet)

This tool is specifically designed for complex personal Mac setups with many interconnected peripherals across different connection types.