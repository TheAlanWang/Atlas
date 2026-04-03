// Pure computation — no React, no "use client". Safe to import from server components.

export type RoadmapItem = { label: string; slug: string | null };
export type RoadmapSection = { title: string; slug?: string; items: RoadmapItem[] };

export type GraphNode = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  data: {
    label: string;
    height?: number;
    written?: boolean;
    isActive?: boolean;
    href?: string | null;
  };
  type: "leaf" | "trunk";
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: "right" | "bottom";
  targetHandle: "left" | "top";
  type: "straight" | "step";
  style: {
    strokeWidth: number;
    stroke: string;
    strokeDasharray?: string;
  };
  markerEnd?: {
    type: "arrowclosed";
    color: string;
    width: number;
    height: number;
  };
};

export const TRUNK_W = 164;
export const TRUNK_H = 44;
export const LEAF_W  = 208;
export const LEAF_H  = 30;
export const TRUNK_X = 0;
export const LEAF_X  = 220;
export const LEAF_GAP    = 10;
export const SECTION_GAP = 10;
export const GRAPH_W = TRUNK_X + LEAF_X + LEAF_W;
export const PAD = 10;

const LEAF_CHARS_PER_LINE = 19;
const LEAF_LINE_HEIGHT = 18;
const LEAF_VERTICAL_PADDING = 14;

function getLeafHeight(label: string) {
  const lines = Math.max(1, Math.ceil(label.length / LEAF_CHARS_PER_LINE));
  return Math.max(LEAF_H, lines * LEAF_LINE_HEIGHT + LEAF_VERTICAL_PADDING);
}

export function buildGraph(sections: RoadmapSection[], basePath: string, activeSlug?: string, viewMode?: "map") {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const trunkIds: string[] = [];
  let y = 0;
  let lastLeafY = 0;

  for (const section of sections) {
    const startY = y;
    const isSingleItemSection = section.items.length === 1;

    for (const item of section.items) {
      const id = item.slug ?? `placeholder-${item.label}`;
      const leafHeight = getLeafHeight(item.label);
      lastLeafY = y;
      nodes.push({
        id,
        position: { x: LEAF_X, y },
        width: LEAF_W,
        height: leafHeight,
        data: {
          label: item.label,
          height: leafHeight,
          written: item.slug !== null,
          isActive: item.slug !== null && item.slug === activeSlug,
          href: item.slug
            ? `${basePath}?slug=${item.slug}${viewMode === "map" ? "&view=map" : ""}`
            : null,
        },
        type: "leaf",
      });

      edges.push({
        id: `b-${id}`,
        source: section.title,
        target: id,
        sourceHandle: "right",
        targetHandle: "left",
        // Step edges read better than rounded smoothsteps for roadmap trees,
        // especially when a section fans out into multiple placeholder nodes.
        type: isSingleItemSection ? "straight" : "step",
        style: { strokeWidth: 1.5, stroke: "#3b82f6", strokeDasharray: "4 4" },
        markerEnd: { type: "arrowclosed", color: "#3b82f6", width: 10, height: 10 },
      });
      y += leafHeight + LEAF_GAP;
    }

    const sectionBottom = y - LEAF_GAP;
    const trunkY = (startY + sectionBottom - TRUNK_H) / 2;
    nodes.push({
      id: section.title,
      position: { x: TRUNK_X, y: trunkY },
      width: TRUNK_W,
      height: TRUNK_H,
      data: {
        label: section.title,
        href: section.slug ? `${basePath}?slug=${section.slug}${viewMode === "map" ? "&view=map" : ""}` : undefined,
      },
      type: "trunk",
    });
    trunkIds.push(section.title);
    y += SECTION_GAP;
  }

  for (let i = 0; i < trunkIds.length - 1; i++) {
    edges.push({
      id: `sp-${i}`,
      source: trunkIds[i],
      target: trunkIds[i + 1],
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "straight",
      style: { strokeWidth: 3, stroke: "#0f172a" },
    });
  }

  const lastNode = nodes.filter((node) => node.type === "leaf").at(-1);
  const graphH = lastNode ? lastNode.position.y + ((lastNode.height as number) ?? LEAF_H) : lastLeafY + LEAF_H;
  return { nodes, edges, graphH };
}
