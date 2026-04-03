"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, Handle, Position, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RoadmapSection } from "@/types";

type Prereq = { label: string; href: string };

type Props = {
  sections: RoadmapSection[];
  activeSlug: string;
  basePath: string;
  prereqs?: Prereq[];
};

const NODE_W = 164;
const TRUNK_X = 8;
const LEAF_X = 20;
const ITEM_GAP = 46;
const SECTION_GAP = 14;

// All node components use only top/bottom handles for vertical flow
function TrunkNode({ data }: { data: { label: string } }) {
  return (
    <div
      className="py-1.5 text-xs font-bold text-center rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
      style={{ width: NODE_W }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />
      {data.label}
    </div>
  );
}

function LeafNode({
  data,
}: {
  data: { label: string; active: boolean; href: string };
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(data.href)}
      className={`py-1.5 text-xs text-center rounded-lg cursor-pointer transition-colors leading-snug ${
        data.active
          ? "bg-blue-600 text-white font-medium"
          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
      }`}
      style={{ width: NODE_W }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />
      {data.label}
    </div>
  );
}

function PrereqNode({ data }: { data: { label: string; href: string } }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(data.href)}
      className="py-1.5 text-xs text-center rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-300"
      style={{ width: NODE_W, border: "2px dashed #94a3b8" }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />
      {data.label} ↗
    </div>
  );
}

const NODE_TYPES = { trunk: TrunkNode, leaf: LeafNode, prereq: PrereqNode };

type RoadmapNodeData =
  | { label: string }
  | { label: string; active: boolean; href: string }
  | { label: string; href: string };

function buildGraph(
  sections: RoadmapSection[],
  activeSlug: string,
  basePath: string,
  prereqs: Prereq[],
) {
  const nodes: Node<RoadmapNodeData>[] = [];
  const edges: Edge[] = [];
  let y = 0;
  let prevId: string | null = null;

  const connect = (a: string, b: string, dashed = false) => {
    edges.push({
      id: `e-${a}-${b}`,
      source: a,
      target: b,
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "straight",
      style: {
        strokeWidth: 1.5,
        stroke: "#475569",
        ...(dashed ? { strokeDasharray: "5,3" } : {}),
      },
    });
  };

  for (const prereq of prereqs) {
    const id = `prereq-${prereq.label}`;
    nodes.push({
      id,
      position: { x: TRUNK_X, y },
      data: prereq,
      type: "prereq",
    });
    if (prevId) connect(prevId, id, true);
    prevId = id;
    y += ITEM_GAP;
  }

  for (const section of sections) {
    if (prevId) y += SECTION_GAP;

    const trunkId = `trunk-${section.title}`;
    nodes.push({
      id: trunkId,
      position: { x: TRUNK_X, y },
      data: { label: section.title },
      type: "trunk",
    });
    if (prevId) connect(prevId, trunkId);
    prevId = trunkId;
    y += ITEM_GAP;

    for (const item of section.items) {
      nodes.push({
        id: item.slug,
        position: { x: LEAF_X, y },
        data: {
          label: item.title,
          active: item.slug === activeSlug,
          href: `${basePath}?slug=${item.slug}`,
        },
        type: "leaf",
      });
      connect(prevId, item.slug);
      prevId = item.slug;
      y += ITEM_GAP;
    }
  }

  return { nodes, edges };
}

export default function RoadmapFlow({
  sections,
  activeSlug,
  basePath,
  prereqs = [],
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const { nodes, edges } = useMemo(
    () => buildGraph(sections, activeSlug, basePath, prereqs),
    [sections, activeSlug, basePath, prereqs],
  );

  return (
    <nav
      className={`relative md:shrink-0 md:-ml-2 transition-all duration-200 ${collapsed ? "md:w-8" : "md:w-52"}`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {!collapsed && (
        <div className="hidden md:block sticky top-18.25 h-[calc(100vh-90px)] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <ReactFlow
            key={activeSlug}
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            defaultViewport={{ x: 8, y: 16, zoom: 1 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            panOnDrag={false}
            panOnScroll={true}
            style={{ background: "transparent" }}
          />
        </div>
      )}

      {/* mobile: simple text list */}
      <div className="md:hidden space-y-3">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Roadmap
        </p>
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {section.title}
            </p>
            {section.items.map((item) => (
              <a
                key={item.slug}
                href={`${basePath}?slug=${item.slug}`}
                className={`block px-2 py-1 rounded text-xs mb-0.5 transition-colors ${
                  item.slug === activeSlug
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.title}
              </a>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
