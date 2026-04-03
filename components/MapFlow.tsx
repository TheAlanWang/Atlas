"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ReactFlow, Handle, Position, type BuiltInEdge, type Node, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  buildGraph,
  GRAPH_W, PAD,
  TRUNK_W, TRUNK_H, LEAF_W, LEAF_H,
  type RoadmapSection,
} from "@/lib/mapGraph";

export type { RoadmapItem, RoadmapSection } from "@/lib/mapGraph";

type Props = {
  sections: RoadmapSection[];
  basePath: string;
  activeSlug?: string;   // highlights the currently selected article
  viewMode?: "map";      // when set, appends &view=map to all hrefs to preserve view
};

// Left column: section header node (e.g. "Introduction", "RAG Pipeline")
function TrunkNode({ data }: { data: { label: string; href?: string } }) {
  return (
    // Outer ring shown only when node is clickable (has an article)
    <div
      className={data.href ? "rounded-lg p-[3px] bg-slate-400 dark:bg-slate-500" : ""}
      style={data.href ? { width: TRUNK_W + 6, height: TRUNK_H + 6, marginLeft: -3, marginTop: -3 } : {}}
    >
    <div
      className={`flex items-center justify-center px-3 text-sm font-semibold leading-tight text-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 ${data.href ? "cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-200" : ""}`}
      style={{ width: TRUNK_W, height: TRUNK_H }}
    >
      {/* Handles are connection points for edges — hidden visually */}
      <Handle type="target" position={Position.Top}    id="top"    style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right}  id="right"  style={{ opacity: 0 }} />
      {data.label}
    </div>
    </div>
  );
}

// Right column: individual topic node (e.g. "Chunking Strategies")
// Solid border = article exists and is clickable
// Dashed border = placeholder, not yet written
// Blue highlight = currently active article
function LeafNode({ data }: { data: { label: string; height?: number; written: boolean; isActive: boolean } }) {
  return (
    <div
      className={`flex items-center justify-center px-3 text-[15px] leading-tight text-center rounded-lg transition-colors ${
        data.isActive
          ? "bg-blue-600 text-white border border-blue-600 cursor-pointer"
          : data.written
          ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-500 cursor-pointer hover:border-slate-500"
          : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-600 cursor-default"
      }`}
      style={{ width: LEAF_W, height: data.height ?? LEAF_H }}
    >
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      {data.label}
    </div>
  );
}

const NODE_TYPES = { trunk: TrunkNode, leaf: LeafNode };

export default function MapFlow({ sections, basePath, activeSlug, viewMode }: Props) {
  const router = useRouter();
  const { nodes, edges, graphH } = buildGraph(sections, basePath, activeSlug, viewMode);
  const flowNodes = nodes as unknown as Node[];
  const flowEdges = edges as unknown as BuiltInEdge[];
  const wrapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance<Node, BuiltInEdge> | null>(null);
  const [mobileHeight, setMobileHeight] = useState<number>(360);

  useEffect(() => {
    function updateViewport() {
      if (!instanceRef.current || !wrapRef.current) return;
      const w = wrapRef.current.clientWidth || GRAPH_W;
      const zoom = Math.min(1, (w - PAD * 2) / GRAPH_W);
      setMobileHeight(Math.max(360, Math.ceil(graphH * zoom + PAD * 2)));
      instanceRef.current.setViewport({ x: PAD, y: PAD, zoom });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, [graphH]);

  return (
    <div
      ref={wrapRef}
      style={{ width: "100%", height: "100%", minHeight: mobileHeight }}
      className="md:min-h-0"
    >
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={NODE_TYPES}
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_, node) => {
        if (node.data.href) {
          router.push(node.data.href as string);
        }
      }}
      onInit={(instance) => {
        instanceRef.current = instance;
        // Zoom to fit width; graph starts at top
        const w = wrapRef.current?.clientWidth ?? GRAPH_W;
        const zoom = Math.min(1, (w - PAD * 2) / GRAPH_W);
        setMobileHeight(Math.max(360, Math.ceil(graphH * zoom + PAD * 2)));
        instance.setViewport({ x: PAD, y: PAD, zoom });
      }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnDoubleClick={false}
      zoomOnPinch={false}
      preventScrolling={false}
      style={{ background: "transparent" }}
    >
    </ReactFlow>
    </div>
  );
}
