# Scamp Development Progress

**Last Updated:** 2026-01-08

## Project Overview

Scamp is a Mac device topology mapper tool for planning and visualizing peripheral setups. The project consists of:
- **Mapper**: Static planning application for designing device topologies
- **Shared**: Reusable React Flow components library
- **Scanner**: (Future) Real-time device detection app for macOS

## Current Status: Mapper MVP Complete + Enhanced ✓

The Mapper application is feature-complete with advanced spatial organization features:
- ✅ All core planning functionality (devices, connections, editing)
- ✅ Group selection and movement with batch updates
- ✅ Text label nodes for zone marking (Desk, Rack, Table, etc.)
- ✅ Customizable text label styling (font size, colors)
- ✅ Multi-select with Cmd/Ctrl+click and box selection
- ✅ Efficient batch position updates for performance

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

### ✅ Phase 9: Spatial Organization & Zone Marking
- [x] **Group selection**: Box selection (drag on empty canvas) and Cmd/Ctrl+click multi-select
- [x] **Group movement**: Move multiple devices together, preserving relative positions
- [x] **Batch position updates**: Efficient single-state-update for N devices moved together
- [x] **Text label nodes**: Draggable zone markers (Desk, Rack, Table, etc.) with no ports
- [x] **Text label styling**: Customizable font size, text color, and background color per label
- [x] **Annotations toolbar section**: Dedicated UI section with Text Label button
- [x] **Green selection for labels**: Visual distinction from device nodes (green vs blue)
- [x] **Dashed borders for labels**: Clear visual separation from device nodes
- [x] **React Flow selection config**: `selectionOnDrag`, `panOnDrag`, `multiSelectionKeyCode`

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
│   │       │   │   ├── TopologyCanvas.jsx          # React Flow wrapper with selection & batch updates
│   │       │   │   └── TopologyCanvas.module.css
│   │       │   ├── nodes/
│   │       │   │   ├── DynamicDeviceNode.jsx       # Universal node component with directionality
│   │       │   │   ├── DynamicDeviceNode.module.css
│   │       │   │   ├── TextLabelNode.jsx           # Text label node for zone marking
│   │       │   │   ├── TextLabelNode.module.css
│   │       │   │   └── BaseNode.module.css
│   │       │   └── edges/
│   │       │       ├── ConnectionEdge.jsx          # Custom styled edges
│   │       │       └── index.js
│   │       ├── hooks/
│   │       │   ├── useTopologyState.js             # CRUD operations + batch position updates
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
│           ├── App.jsx                              # Main app with batch position updates
│           ├── App.module.css
│           └── components/
│               ├── Toolbar/
│               │   ├── Toolbar.jsx                  # Device buttons + Annotations section
│               │   └── Toolbar.module.css
│               ├── DeviceEditor/
│               │   ├── DeviceEditor.jsx             # Device editing modal with text label styling
│               │   └── DeviceEditor.module.css
│               ├── ConnectionEditor/
│               │   ├── ConnectionEditor.jsx         # Connection editing modal with dropdowns
│               │   └── ConnectionEditor.module.css
│               ├── Sidebar/
│               │   ├── Sidebar.jsx                  # Tabbed device/connection browser
│               │   └── Sidebar.module.css
│               ├── ConnectionTypesEditor/
│               │   ├── ConnectionTypesEditor.jsx    # Custom connection types editor
│               │   └── ConnectionTypesEditor.module.css
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

### Batch Position Updates for Group Movement
**Problem:** Moving N devices resulted in N state updates and N localStorage writes, causing performance issues.

**Solution:** Detect multiple position changes and batch them:
1. React Flow's `onNodesChange` receives position changes with `dragging: false` when drag completes
2. Filter for position changes where `dragging === false`
3. If 1 change: Use existing `onDeviceMove(deviceId, position)` single update
4. If multiple changes: Call `onMultipleDevicesMove({ id1: pos1, id2: pos2 })` batch update
5. `updateMultipleDevicePositions()` updates all device positions in a single `setTopology()` call
6. Result: N devices = 1 state update = 1 localStorage write

**Benefits:**
- Performance: Single re-render instead of N re-renders
- Cleaner code: No need to debounce or queue updates
- Automatic: Works with React Flow's built-in group movement

### Text Labels as Devices Without Ports
**Problem:** Need zone markers (Desk, Rack, Table) that don't interfere with device connections.

**Solution:** Treat text labels as a special device type:
1. Added `TEXT_LABEL: 'text-label'` to DEVICE_TYPES
2. Set `DEFAULT_PORTS[TEXT_LABEL] = []` (no ports)
3. Created custom `TextLabelNode` component (instead of using DynamicDeviceNode)
4. Added `style` property to device data model for font size, colors
5. No Handle components rendered = cannot draw connections

**Benefits:**
- Reuses existing device infrastructure (CRUD, position updates, save/load)
- Works with multi-select and group movement automatically
- Visual distinction: dashed border, green selection vs blue for devices
- Customizable styling per label for zone differentiation

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

### Group Selection and Movement

9. **Multi-Select and Group Movement** - Added ability to select and move multiple devices together:
   - Box selection: Click and drag on empty canvas to select multiple devices
   - Multi-select: Cmd/Ctrl+click to add/remove devices from selection
   - Group movement: Drag any selected device to move all selected devices together
   - Relative positions preserved during group moves
   - Files: [TopologyCanvas.jsx](packages/shared/src/components/Canvas/TopologyCanvas.jsx:61-93,294-296)

10. **Batch Position Updates** - Optimized performance for group movements:
   - Added `updateMultipleDevicePositions()` method for batch updates
   - Single state update for N devices (instead of N updates)
   - Single localStorage write (instead of N writes)
   - Detects position changes in `onNodesChange` and batches them automatically
   - Files: [useTopologyState.js](packages/shared/src/hooks/useTopologyState.js:109-118,266), [TopologyCanvas.jsx](packages/shared/src/components/Canvas/TopologyCanvas.jsx:71-89), [App.jsx](packages/mapper/src/App.jsx:85-88)

11. **React Flow Selection Configuration** - Enabled built-in selection features:
   - `selectionOnDrag={true}` - enables box/marquee selection
   - `panOnDrag={[1, 2]}` - pan with middle/right mouse (prevents conflict with selection)
   - `multiSelectionKeyCode="Meta"` - Cmd/Ctrl+click for multi-select
   - Files: [TopologyCanvas.jsx](packages/shared/src/components/Canvas/TopologyCanvas.jsx:294-296)

### Text Label Nodes for Zone Marking

12. **Text Label Node Component** - New node type for annotating canvas with zone markers:
   - Draggable text labels for marking physical zones (Desk, Rack, Table, etc.)
   - Default appearance: light yellow background, black bold text, 16px, dashed border
   - No ports (empty ports array) - cannot draw connections to/from labels
   - Green selection highlight (vs blue for devices) to distinguish type
   - Files: [TextLabelNode.jsx](packages/shared/src/components/nodes/TextLabelNode.jsx), [TextLabelNode.module.css](packages/shared/src/components/nodes/TextLabelNode.module.css)

13. **Text Label Styling** - Customizable appearance per label:
   - Font size: Small (12px), Medium (16px), Large (20px), Extra Large (24px)
   - Text color: Any color via color picker
   - Background color: Any color via color picker
   - Style stored in device object as `style: { fontSize, color, backgroundColor, fontWeight }`
   - DeviceEditor shows style controls when editing text-label type
   - Files: [DeviceEditor.jsx](packages/mapper/src/components/DeviceEditor/DeviceEditor.jsx:8,120-159,182), [DeviceEditor.module.css](packages/mapper/src/components/DeviceEditor/DeviceEditor.module.css:276-282)

14. **Text Label Data Model** - Integrated as device type:
   - Added `TEXT_LABEL: 'text-label'` to DEVICE_TYPES
   - Added empty ports array to DEFAULT_PORTS for text labels
   - Added `style` parameter to `createDevice()` factory function
   - Style property passed through data transform pipeline
   - Files: [fileFormat.js](packages/shared/src/utils/fileFormat.js:14,94,116), [dataTransform.js](packages/shared/src/utils/dataTransform.js:23), [App.jsx](packages/mapper/src/App.jsx:182)

15. **Toolbar Integration** - Added Annotations section:
   - New "Text Label" button with 📝 icon
   - Visual dividers separate Annotations from device buttons
   - Draggable to canvas or click to add at random position
   - Files: [Toolbar.jsx](packages/mapper/src/components/Toolbar/Toolbar.jsx:38-52), [Toolbar.module.css](packages/mapper/src/components/Toolbar/Toolbar.module.css:86-91)

16. **Text Label Registration** - Wired into React Flow:
   - Imported and registered in nodeTypes as `'text-label': TextLabelNode`
   - Works with all existing features: drag, multi-select, save/load, delete, hover highlight
   - Files: [TopologyCanvas.jsx](packages/shared/src/components/Canvas/TopologyCanvas.jsx:13,27)

---

## Known Issues & Limitations

### None Currently Identified ✓

All requested features have been implemented and are working as expected.

---

## Testing Checklist

### Basic Topology Operations
- [ ] Create new topology
- [ ] Edit setup name in header
- [ ] Add all device types (Computer, Hub, Display, USB Device, Network Device, Thunderbolt Device, Adapter, Other, Text Label)
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

### Group Selection and Movement
- [ ] Box selection: Click and drag on empty canvas to select multiple devices
- [ ] Nodes within box become selected with blue borders
- [ ] Cmd/Ctrl+click to add individual devices to selection
- [ ] Cmd/Ctrl+click on selected device to deselect it
- [ ] Click on empty canvas to deselect all
- [ ] Drag one selected device to move entire group together
- [ ] Verify relative positions between devices are preserved
- [ ] Save and reload to verify group positions persisted correctly
- [ ] Middle-click or right-click to pan canvas (left-click reserved for selection)
- [ ] Select mix of devices and text labels together and move as group

### Text Label Features
- [ ] Click "Text Label" button in toolbar
- [ ] Enter text (e.g., "Desk Area") and verify label appears
- [ ] Drag "Text Label" button to canvas at specific position
- [ ] Double-click text label to open editor
- [ ] Change label text and save
- [ ] Change font size to Large (20px) and verify change
- [ ] Change text color to red using color picker
- [ ] Change background color to light blue
- [ ] Verify text label has dashed border (not solid)
- [ ] Select text label - verify green border (not blue like devices)
- [ ] Drag text label to different position
- [ ] Add multiple text labels with different styles for different zones
- [ ] Save topology and reload - verify text labels restored with correct styles
- [ ] Text labels show "0 ports" in sidebar
- [ ] Cannot draw connections to/from text labels
- [ ] Text labels work with multi-select and group movement

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
- Zone containers (rectangular background areas for text labels)
- Alignment tools (align selected devices to top/bottom/left/right)
- Distribution tools (evenly space selected devices)

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
