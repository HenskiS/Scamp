import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { topologyToReactFlow } from '../../utils/dataTransform.js';
import DynamicDeviceNode from '../nodes/DynamicDeviceNode.jsx';
import TextLabelNode from '../nodes/TextLabelNode.jsx';
import { ConnectionEdge } from '../edges/index.js';
import styles from './TopologyCanvas.module.css';

// Register custom node types - all use DynamicDeviceNode now
const nodeTypes = {
  'computer': DynamicDeviceNode,
  'hub': DynamicDeviceNode,
  'display': DynamicDeviceNode,
  'usb-device': DynamicDeviceNode,
  'network-device': DynamicDeviceNode,
  'thunderbolt-device': DynamicDeviceNode,
  'adapter': DynamicDeviceNode,
  'other': DynamicDeviceNode,
  'text-label': TextLabelNode
};

// Register custom edge types
const edgeTypes = {
  'connection': ConnectionEdge
};

export default function TopologyCanvas({
  topology = null,
  canvas = 'current',
  onDeviceMove,
  onMultipleDevicesMove,
  onDeviceDelete,
  onConnect,
  onEdgeDelete,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  onCanvasDrop,
  readOnly = false,
  showPortLabels = true,
  highlightedDeviceId = null,
  highlightedConnectionId = null,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onEdgeMouseEnter,
  onEdgeMouseLeave
}) {
  // Initialize nodes and edges from props
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Handle nodes being deleted (via Delete key or other means)
  const handleNodesChange = useCallback((changes) => {
    // Check if any nodes are being removed
    const removedNodes = changes.filter(change => change.type === 'remove');

    if (removedNodes.length > 0 && onDeviceDelete) {
      removedNodes.forEach(change => {
        onDeviceDelete(change.id);
      });
    }

    // Check for position changes (from dragging)
    const positionChanges = changes.filter(
      change => change.type === 'position' && change.dragging === false
    );

    if (positionChanges.length > 0) {
      if (positionChanges.length === 1 && onDeviceMove) {
        // Single device moved - use existing callback
        const change = positionChanges[0];
        onDeviceMove(change.id, change.position);
      } else if (positionChanges.length > 1 && onMultipleDevicesMove) {
        // Multiple devices moved - use batch callback
        const positionUpdates = {};
        positionChanges.forEach(change => {
          positionUpdates[change.id] = change.position;
        });
        onMultipleDevicesMove(positionUpdates);
      }
    }

    // Apply the changes to the local state
    onNodesChange(changes);
  }, [onNodesChange, onDeviceDelete, onDeviceMove, onMultipleDevicesMove]);

  // Handle edges being deleted (via Delete key or other means)
  const handleEdgesChange = useCallback((changes) => {
    // Check if any edges are being removed
    const removedEdges = changes.filter(change => change.type === 'remove');

    if (removedEdges.length > 0 && onEdgeDelete) {
      removedEdges.forEach(change => {
        onEdgeDelete(change.id);
      });
    }

    // Apply the changes to the local state
    onEdgesChange(changes);
  }, [onEdgesChange, onEdgeDelete]);

  // Transform topology data to React Flow format when topology changes
  useEffect(() => {
    if (topology) {
      const { nodes: transformedNodes, edges: transformedEdges } = topologyToReactFlow(topology, canvas);

      // Add showPortLabels to each node's data
      const nodesWithLabels = transformedNodes.map(node => ({
        ...node,
        data: { ...node.data, showPortLabels, highlighted: false }
      }));

      const edgesWithData = transformedEdges.map(edge => ({
        ...edge,
        data: { ...edge.data, highlighted: false, showPortLabels }
      }));

      setNodes(nodesWithLabels);
      setEdges(edgesWithData);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [topology, canvas, setNodes, setEdges, showPortLabels]);

  // Update highlight state separately to avoid recreating all nodes
  useEffect(() => {
    if (!topology) return;

    // Find connections related to highlighted device
    const relatedConnectionIds = new Set();
    if (highlightedDeviceId) {
      topology.connections.forEach(conn => {
        if (conn.source === highlightedDeviceId || conn.target === highlightedDeviceId) {
          relatedConnectionIds.add(conn.id);
        }
      });
    }

    // Find devices related to highlighted connection
    const relatedDeviceIds = new Set();
    if (highlightedConnectionId) {
      const conn = topology.connections.find(c => c.id === highlightedConnectionId);
      if (conn) {
        relatedDeviceIds.add(conn.source);
        relatedDeviceIds.add(conn.target);
      }
    }

    // Update node data without recreating nodes
    setNodes(nds =>
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlighted: node.id === highlightedDeviceId || relatedDeviceIds.has(node.id)
        }
      }))
    );

    // Update edge data without recreating edges
    setEdges(eds =>
      eds.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          highlighted: edge.id === highlightedConnectionId || relatedConnectionIds.has(edge.id)
        }
      }))
    );
  }, [highlightedDeviceId, highlightedConnectionId, topology, setNodes, setEdges]);

  // Handle node drag end to notify parent
  const handleNodeDragStop = useCallback((event, node) => {
    if (onDeviceMove) {
      onDeviceMove(node.id, node.position);
    }
  }, [onDeviceMove]);

  // Handle new connections
  const handleConnect = useCallback((connection) => {
    if (onConnect) {
      onConnect(connection);
    }
  }, [onConnect]);

  // Handle node clicks
  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  // Handle node double-clicks
  const handleNodeDoubleClick = useCallback((event, node) => {
    if (onNodeDoubleClick) {
      onNodeDoubleClick(event, node);
    }
  }, [onNodeDoubleClick]);

  // Handle edge double-clicks
  const handleEdgeDoubleClick = useCallback((event, edge) => {
    if (onEdgeDoubleClick) {
      onEdgeDoubleClick(event, edge);
    }
  }, [onEdgeDoubleClick]);

  // Handle node mouse enter
  const handleNodeMouseEnter = useCallback((event, node) => {
    if (onNodeMouseEnter) {
      onNodeMouseEnter(node.id);
    }
  }, [onNodeMouseEnter]);

  // Handle node mouse leave
  const handleNodeMouseLeave = useCallback(() => {
    if (onNodeMouseLeave) {
      onNodeMouseLeave();
    }
  }, [onNodeMouseLeave]);

  // Handle edge mouse enter
  const handleEdgeMouseEnter = useCallback((event, edge) => {
    if (onEdgeMouseEnter) {
      onEdgeMouseEnter(edge.id);
    }
  }, [onEdgeMouseEnter]);

  // Handle edge mouse leave
  const handleEdgeMouseLeave = useCallback(() => {
    if (onEdgeMouseLeave) {
      onEdgeMouseLeave();
    }
  }, [onEdgeMouseLeave]);

  // Handle drag over to allow dropping
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to create new device at drop position
  const handleDrop = useCallback((event) => {
    event.preventDefault();

    if (!reactFlowInstance || !onCanvasDrop) return;

    const deviceType = event.dataTransfer.getData('application/reactflow');
    if (!deviceType) return;

    // Get the bounding box of the React Flow wrapper
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

    // Calculate position relative to the React Flow canvas
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    onCanvasDrop(deviceType, position);
  }, [reactFlowInstance, onCanvasDrop]);

  return (
    <div className={styles.canvasContainer} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        onInit={setReactFlowInstance}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        fitView
        className={styles.reactFlow}
        selectionOnDrag={false}
        panOnDrag={true}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Meta"
      >
        <Background />
        <Controls />
        <MiniMap
          className={styles.minimap}
          nodeColor="#e0e0e0"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
