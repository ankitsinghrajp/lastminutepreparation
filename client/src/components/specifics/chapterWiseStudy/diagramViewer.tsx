import React, { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function DiagramViewer({ nodes = [], edges = [] }) {
  const safeNodes = useMemo(() => {
    return nodes.map((n, i) => ({
      id: n.id,
      data: { label: n.data?.label || n.label || "Node" },
      position: n.position || { x: 300 * (n.level || 0), y: i * 120 },
    }));
  }, [nodes]);

  return (
    <div style={{ width: "100%", height: "600px", overflow: "hidden" }}>
      <ReactFlow 
        nodes={safeNodes} 
        edges={edges} 
        fitView
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnDrag={true}
        preventScrolling={true}
        minZoom={0.1}
        maxZoom={2}
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}