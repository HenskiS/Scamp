# Scamp Development Progress

**Last Updated:** 2026-01-07

## Project Overview

Scamp is a Mac device topology mapper tool for planning and visualizing peripheral setups. The project consists of:
- **Mapper**: Static planning application for designing device topologies
- **Shared**: Reusable React Flow components library
- **Scanner**: (Future) Real-time device detection app for macOS

## Current Status: Mapper MVP Complete ✓

The Mapper application is feature-complete for Phase 1-8 planning tasks. All core functionality is working.

---

## Completed Features

### ✅ Phase 1-3: Foundation & Data Layer
- [x] Monorepo setup with npm workspaces
- [x] Vite build configuration (shared as library, mapper as app)
- [x] File format schema with validation (v1.0)
- [x] State management with React Context (`useTopologyState`)
- [x] File I/O (import/export JSON topology files)
- [x] LocalStorage persistence
- [x] Event logging system

### ✅ Phase 4-5: Visual Components
- [x] Dynamic device node rendering with `DynamicDeviceNode.jsx`
- [x] 7 device types: Computer, Hub, Display, USB Device, Network Device, Thunderbolt Device, Adapter
- [x] Color-coded connection types (USB=blue, Thunderbolt=gold, Ethernet=green, DisplayPort=purple, HDMI=red)
- [x] Custom connection edges with styling
- [x] Port system with configurable positions (left, right, top, bottom)
- [x] **Port directionality**: IN (target only), OUT (source only), BIDIRECTIONAL
- [x] Color-coded port handles matching connection types
- [x] **Port label toggle**: Show/hide labels via header button
- [x] Device icons with emojis

### ✅ Phase 6-7: UI & Interaction
- [x] React Flow canvas with drag, zoom, pan
- [x] Device drag-and-drop repositioning
- [x] **Drag-and-drop device placement**: Drag from toolbar directly onto canvas
- [x] Connection drawing between ports
- [x] Device deletion (Delete key or editor)
- [x] Connection deletion (Delete key or editor)
- [x] Double-click to edit devices
- [x] Double-click to edit connections
- [x] Device editor modal with port configuration
- [x] **Port label uniqueness validation**: Enforces unique port labels per device
- [x] Connection editor modal with device/port dropdowns
- [x] **Manual connection editing**: Change source/target devices and ports
- [x] Toolbar with device type buttons
- [x] Header with New/Open/Save and setup name input
- [x] **Sidebar**: Tabbed device/connection browser with click to edit
- [x] **Hover highlighting**: Devices/connections highlight when hovered in sidebar or canvas
- [x] Event log panel (reverse chronological order)
- [x] Status bar showing device/connection counts
- [x] MiniMap and canvas controls

### ✅ Phase 8: Polish & Enhancements
- [x] Adapter device type for USB-to-Ethernet converters
- [x] Smaller styling for adapter nodes (80x60px vs 120x80px)
- [x] Port label positioning with proper offsets (18px)
- [x] Direction field in port configuration
- [x] Direction dropdown in DeviceEditor
- [x] localStorage preference for port labels
- [x] **Visual port direction indicators**: Arrow overlays on ports (IN/OUT/BIDIRECTIONAL)
- [x] **Animated crawling connections**: Dashed stroke-dashoffset animation showing data flow
- [x] **Connection type auto-detection**: Defaults to port type instead of name-based heuristic
- [x] **Status messages removed**: All events consolidated in EventLog only
- [x] Visual feedback and hover states
- [x] Tooltip updates for drag-and-drop

---

## File Structure

```
Scamp/
├── PROJECT_OVERVIEW.md              # Original project specification
├── PROGRESS.md                      # This file
├── package.json                     # Root workspace config
├── packages/
│   ├── shared/                      # Reusable React Flow library
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── index.js                 # Main exports
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Canvas/
│   │       │   │   ├── TopologyCanvas.jsx          # React Flow wrapper with drop handling
│   │       │   │   └── TopologyCanvas.module.css
│   │       │   ├── nodes/
│   │       │   │   ├── DynamicDeviceNode.jsx       # Universal node component with directionality
│   │       │   │   ├── DynamicDeviceNode.module.css
│   │       │   │   └── BaseNode.module.css
│   │       │   └── edges/
│   │       │       ├── ConnectionEdge.jsx          # Custom styled edges
│   │       │       └── index.js
│   │       ├── hooks/
│   │       │   ├── useTopologyState.js             # CRUD operations for topology
│   │       │   └── useFileIO.js                    # Import/export JSON files
│   │       ├── utils/
│   │       │   ├── fileFormat.js                   # Schema, constants, factory functions
│   │       │   └── dataTransform.js                # Topology ↔ React Flow conversion
│   │       └── styles/
│   │           └── theme.css                       # CSS variables (swapped USB/TB colors)
│   │
│   └── mapper/                      # Static planning application
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
│           ├── main.jsx
│           ├── App.jsx                              # Main app with port label toggle
│           ├── App.module.css
│           └── components/
│               ├── Toolbar/
│               │   ├── Toolbar.jsx                  # Draggable device buttons
│               │   └── Toolbar.module.css
│               ├── DeviceEditor/
│               │   ├── DeviceEditor.jsx             # Device editing modal with direction dropdown
│               │   └── DeviceEditor.module.css
│               ├── ConnectionEditor/
│               │   ├── ConnectionEditor.jsx         # Connection editing modal with dropdowns
│               │   └── ConnectionEditor.module.css
│               ├── Sidebar/
│               │   ├── Sidebar.jsx                  # Tabbed device/connection browser
│               │   └── Sidebar.module.css
│               └── EventLog/
│                   ├── EventLog.jsx                 # Reverse chronological event list
│                   └── EventLog.module.css
```

---

## Key Technical Decisions

### Port Directionality System
**Problem:** React Flow connections were bidirectional by default, making it unclear which device was source vs target.

**Solution:** Added `PORT_DIRECTIONS` enum with three values:
- `IN`: Renders target handle only (receives data)
- `OUT`: Renders source handle only (sends data)
- `BIDIRECTIONAL`: Renders both handles (default)

**Default Port Directions:**
- Computer ports: BIDIRECTIONAL (host can send/receive)
- Hub upstream: IN (connects to host)
- Hub downstream: OUT (connects to peripherals)
- Display input: IN, output: OUT
- USB/Thunderbolt devices: Typically IN
- Adapter input: IN, output: OUT

### Color Coding
- **USB**: Blue (#4169e1)
- **Thunderbolt**: Gold/Yellow (#f4c430)
- **Ethernet**: Green (#32cd32)
- **DisplayPort**: Purple (#9370db)
- **HDMI**: Red (#ff6347)

Colors applied to:
- Port handles (14x14px colored circles)
- Connection edges (stroke color)
- Device borders (based on primary device type)

### Drag-and-Drop Implementation
Uses native HTML5 drag-and-drop API:
1. Toolbar buttons set `draggable` attribute
2. `onDragStart` stores device type in `dataTransfer`
3. Canvas wrapper listens for `onDrop` events
4. React Flow's `screenToFlowPosition()` converts mouse coordinates to canvas position
5. Callback triggers normal device creation flow with exact drop position

---

## Recent Changes (2026-01-07 Evening Session)

### UI Enhancements

1. **Setup Name Input** - Added editable setup name field in header center. Name is stored in topology and persisted.
   - Files: [App.jsx](packages/mapper/src/App.jsx:238-240), [App.module.css](packages/mapper/src/App.module.css:35-66)

2. **Port Labels Toggle Relocated** - Moved from header to toolbar right section for better organization.
   - Files: [Toolbar.jsx](packages/mapper/src/components/Toolbar/Toolbar.jsx), [Toolbar.module.css](packages/mapper/src/components/Toolbar/Toolbar.module.css:55-83)

3. **Sidebar Component** - New left sidebar with tabbed interface showing:
   - Device list: Name, type, canvas, port count with expandable port details
   - Connection list: Type, label, full path with device names and ports
   - Click any item to open editor
   - Files: [Sidebar.jsx](packages/mapper/src/components/Sidebar/Sidebar.jsx), [Sidebar.module.css](packages/mapper/src/components/Sidebar/Sidebar.module.css)

4. **Hover Highlighting System** - Synchronized highlighting across sidebar and canvas:
   - Hover device → highlights device + all connections
   - Hover connection → highlights connection + both connected devices
   - Uses efficient state updates to avoid node recreation
   - Files: [App.jsx](packages/mapper/src/App.jsx:27-28,255-270), [TopologyCanvas.jsx](packages/shared/src/components/Canvas/TopologyCanvas.jsx:106-151)

### Visual Enhancements

5. **Port Direction Arrows** - Visual indicators on port handles using CSS pseudo-elements:
   - IN ports: arrows pointing into device (→ ← ↓ ↑)
   - OUT ports: arrows pointing out of device (← → ↑ ↓)
   - BIDIRECTIONAL: double arrows (↔ ↕)
   - Files: [DynamicDeviceNode.jsx](packages/shared/src/components/nodes/DynamicDeviceNode.jsx:109-111), [DynamicDeviceNode.module.css](packages/shared/src/components/nodes/DynamicDeviceNode.module.css:44-131)

6. **Animated Crawling Connections** - CSS animation showing data flow direction:
   - Dashed stroke pattern with `stroke-dashoffset` animation
   - Automatically flows source → target (OUT → IN)
   - GPU-accelerated, no JavaScript overhead
   - Files: [ConnectionEdge.jsx](packages/shared/src/components/edges/ConnectionEdge.jsx:47-53), [ConnectionEdge.module.css](packages/shared/src/components/edges/ConnectionEdge.module.css:45-57)

### Data & Editing Enhancements

7. **Connection Type Auto-Detection** - Now uses actual port types instead of name-based heuristics:
   - Looks up port objects by ID
   - Uses source port type, falls back to target port type
   - File: [App.jsx](packages/mapper/src/App.jsx:84-113)

8. **Manual Connection Editing** - Connection editor now allows changing endpoints:
   - Device dropdowns for source/target
   - Port dropdowns (filtered by selected device)
   - Automatically resets port selection when device changes
   - File: [ConnectionEditor.jsx](packages/mapper/src/components/ConnectionEditor/ConnectionEditor.jsx)

9. **Port Label Uniqueness Validation** - Enforces unique port labels per device:
   - Validates on save in DeviceEditor
   - Shows alert with duplicate port names
   - File: [DeviceEditor.jsx](packages/mapper/src/components/DeviceEditor/DeviceEditor.jsx:39-63)

10. **Status Messages Removed** - Cleaned up UI by removing temporary header messages:
    - All events now only appear in EventLog
    - Removed message state and setTimeout calls
    - File: [App.jsx](packages/mapper/src/App.jsx) (multiple locations)

## Previous Changes (2026-01-07 Earlier)

1. **Port Label Toggle** - Added button in header to show/hide port labels. Preference saved to localStorage.

2. **Port Directionality** - Implemented IN/OUT/BIDIRECTIONAL port types.

3. **Drag-and-Drop Device Placement** - Can now drag device buttons from toolbar onto canvas for precise positioning.

4. **Event Log Ordering** - Events now display in reverse chronological order (most recent first).

5. **Adapter Device Type** - Added new device type for converters (USB-to-Ethernet, etc.) with smaller visual footprint.

---

## Recent Changes (2026-01-08)

### Custom Connection Types System

1. **Connection Types Editor** - New right sidebar for managing custom cable/connection types:
   - Toggle with "Cable Types ▶/◀" button in header
   - Add custom connection types with name and color
   - Edit existing types (name and color picker)
   - Delete types (with protection against deleting types in use)
   - Visual color picker + hex input field
   - Files: [ConnectionTypesEditor.jsx](packages/mapper/src/components/ConnectionTypesEditor/ConnectionTypesEditor.jsx), [ConnectionTypesEditor.module.css](packages/mapper/src/components/ConnectionTypesEditor/ConnectionTypesEditor.module.css)

2. **Dynamic Connection Type System** - Connection types are now part of the topology data model:
   - Default types: USB (blue), Thunderbolt (gold), Ethernet (green), DisplayPort (purple), HDMI (red)
   - Custom types stored in topology JSON with `{ id, name, color }` format
   - Backwards compatible: old files without `connectionTypes` get defaults added automatically
   - File: [fileFormat.js](packages/shared/src/utils/fileFormat.js:24-31,95-101)

3. **State Management** - Added CRUD operations for connection types:
   - `addConnectionType()`, `updateConnectionType()`, `removeConnectionType()`
   - Protection against deleting types that are in use by connections or ports
   - File: [useTopologyState.js](packages/shared/src/hooks/useTopologyState.js:191-232)

4. **Dynamic Colors** - Connection type colors now flow through entire system:
   - Port handles on devices use custom colors
   - Connection edges use custom colors
   - All dropdowns show custom type names
   - Files: [DynamicDeviceNode.jsx](packages/shared/src/components/nodes/DynamicDeviceNode.jsx:44-60), [dataTransform.js](packages/shared/src/utils/dataTransform.js:59-96)

5. **Display Names Everywhere** - All UI components now show proper connection type names:
   - Sidebar device port lists
   - Sidebar connection lists
   - DeviceEditor connections section
   - ConnectionEditor type dropdown
   - DeviceEditor port type dropdown
   - Connection edge labels on canvas
   - Files: [Sidebar.jsx](packages/mapper/src/components/Sidebar/Sidebar.jsx:24-28), [ConnectionEdge.jsx](packages/shared/src/components/edges/ConnectionEdge.jsx:26-40), [DeviceEditor.jsx](packages/mapper/src/components/DeviceEditor/DeviceEditor.jsx:37-41)

6. **Missing Type Handling** - Graceful degradation for deleted or missing types:
   - DeviceEditor shows missing port types as "(missing)" in dropdown
   - ConnectionEditor shows missing connection types as "(missing)" in dropdown
   - Prevents items from disappearing when editing
   - Files: [DeviceEditor.jsx](packages/mapper/src/components/DeviceEditor/DeviceEditor.jsx:12-24), [ConnectionEditor.jsx](packages/mapper/src/components/ConnectionEditor/ConnectionEditor.jsx:16-24)

7. **Validation Fix** - Fixed critical bug in connection type validation:
   - Was replacing valid types instead of adding to them
   - Now accepts both default types (usb, thunderbolt, etc.) AND custom types
   - File: [fileFormat.js](packages/shared/src/utils/fileFormat.js:209-224)

8. **Other Device Type** - Added generic device type for miscellaneous equipment:
   - No default ports (user adds their own)
   - Box icon (📦)
   - Gray border color
   - Perfect for audio interfaces, MIDI controllers, iLoks, dongles, etc.
   - Files: [fileFormat.js](packages/shared/src/utils/fileFormat.js:13,92), [DynamicDeviceNode.jsx](packages/shared/src/components/nodes/DynamicDeviceNode.jsx:25,40), [Toolbar.jsx](packages/mapper/src/components/Toolbar/Toolbar.jsx:12)

---

## Known Issues & Limitations

### None Currently Identified ✓

All requested features have been implemented and are working as expected.

---

## Testing Checklist

### Basic Topology Operations
- [ ] Create new topology
- [ ] Edit setup name in header
- [ ] Add all 8 device types (Computer, Hub, Display, USB Device, Network Device, Thunderbolt Device, Adapter, Other)
- [ ] Click to add devices at random positions
- [ ] Drag devices from toolbar to specific canvas positions
- [ ] Draw connections between devices
- [ ] Verify connection type matches port type
- [ ] Delete devices and connections (Delete key)
- [ ] Save topology to JSON file
- [ ] Open saved topology

### Device Editing
- [ ] Double-click device to edit
- [ ] Change device name
- [ ] Add new ports
- [ ] Change port direction (IN/OUT/BIDIRECTIONAL)
- [ ] Try to save with duplicate port labels (should fail with alert)
- [ ] Change port labels to unique names and save successfully
- [ ] Delete device from editor

### Connection Editing
- [ ] Double-click connection to edit
- [ ] Change connection type
- [ ] Add connection label
- [ ] Change source device via dropdown
- [ ] Change source port (should update based on device)
- [ ] Change target device via dropdown
- [ ] Change target port (should update based on device)
- [ ] Delete connection from editor

### Visual Features
- [ ] Toggle port labels on/off (button in toolbar)
- [ ] Verify port direction arrows appear (IN/OUT/BIDIRECTIONAL)
- [ ] Verify connections animate with crawling dashes
- [ ] Verify ports only allow connections based on direction (IN can't be source, OUT can't be target)

### Sidebar & Highlighting
- [ ] Open sidebar Devices tab
- [ ] Click device in sidebar (should open editor)
- [ ] Hover device in sidebar (should highlight device + connections on canvas)
- [ ] Open sidebar Connections tab
- [ ] Click connection in sidebar (should open editor)
- [ ] Hover connection in sidebar (should highlight connection + both devices on canvas)
- [ ] Hover device on canvas (should highlight in sidebar)
- [ ] Hover connection on canvas (should highlight in sidebar)

### Event Log
- [ ] Check event log shows actions in reverse chronological order
- [ ] Verify no temporary messages appear in header (all events in log only)

---

## Next Steps (Future Phases)

### Scanner Application (Not Started)
- macOS system_profiler integration
- Real-time device detection
- Live status indicators on nodes (green/red/white dots)
- WebSocket/polling for device updates
- Topology auto-generation from detected devices
- Comparison view: detected vs. planned topology

### Mapper Enhancements (Optional)
- Undo/redo functionality
- Keyboard shortcuts (Cmd+S, Cmd+O, Cmd+Z, etc.)
- Copy/paste devices
- Device templates/presets
- Canvas zoom to selection
- Export to PNG/SVG
- Dark mode
- Multiple topology tabs
- Search/filter devices

---

## Development Commands

```bash
# Install dependencies
npm install

# Run mapper in development mode
npm run dev -w packages/mapper

# Build for production
npm run build

# Run both packages
npm run dev
```

---

## References

- **Plan File**: `C:\Users\hensk\.claude\plans\lovely-whistling-clarke.md`
- **Original Spec**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **React Flow Docs**: https://reactflow.dev/
- **Vite Docs**: https://vitejs.dev/
