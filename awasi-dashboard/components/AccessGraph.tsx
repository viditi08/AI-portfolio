"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Eye, EyeOff } from "lucide-react";
import { nodes, edges, GraphNode, NodeType } from "@/lib/mockData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ─── Colour palette ─────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, string> = {
  user: "#3b82f6",     // blue-500
  agent: "#8b5cf6",    // violet-500
  app: "#2dd4bf",      // teal-400
  datastore: "#f59e0b", // amber-500
};

const RISK_RING: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  none: "transparent",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawNode(
  node: GraphNode & { x?: number; y?: number },
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  isHovered: boolean,
  isSelected: boolean
) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const r = node.type === "datastore" ? 10 : node.type === "app" ? 8 : 7;
  const color = NODE_COLORS[node.type];

  // Glow for hovered/selected
  if (isHovered || isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(x, y, r, x, y, r + 8);
    grad.addColorStop(0, `${color}44`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Risk ring
  if (node.riskLevel !== "none") {
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = RISK_RING[node.riskLevel];
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Main circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = isSelected ? color : `${color}cc`;
  ctx.fill();

  // Border
  ctx.strokeStyle = isSelected ? "#ffffff44" : `${color}66`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label
  const fontSize = Math.max(9 / globalScale, 9);
  ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = isSelected || isHovered ? "#f1f5f9" : "#94a3b8";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(node.name.split(" ").slice(0, 2).join(" "), x, y + r + 3);
}

// ─── Legend ──────────────────────────────────────────────────────────────────

const LEGEND_ITEMS: { type: NodeType; label: string }[] = [
  { type: "user", label: "User" },
  { type: "agent", label: "AI Agent" },
  { type: "app", label: "Integration" },
  { type: "datastore", label: "Data Store" },
];

interface AccessGraphProps {
  onNodeClick: (node: GraphNode | null) => void;
  selectedNodeId: string | null;
}

export function AccessGraph({ onNodeClick, selectedNodeId }: AccessGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Record<NodeType, boolean>>({
    user: true,
    agent: true,
    app: true,
    datastore: true,
  });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const filteredNodes = nodes.filter((n) => visibleTypes[n.type]);
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges
    .filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))
    .map((e) => ({ ...e }));

  const graphData = {
    nodes: filteredNodes.map((n) => ({ ...n })),
    links: filteredEdges,
  };

  const handleNodeClick = useCallback(
    (node: object) => {
      const n = node as GraphNode;
      onNodeClick(selectedNodeId === n.id ? null : n);
    },
    [onNodeClick, selectedNodeId]
  );

  const handleBackgroundClick = useCallback(() => {
    onNodeClick(null);
  }, [onNodeClick]);

  const paintNode = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x?: number; y?: number };
      drawNode(n, ctx, globalScale, hoveredId === n.id, selectedNodeId === n.id);
    },
    [hoveredId, selectedNodeId]
  );

  const toggleType = (type: NodeType) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="relative w-full h-full bg-[#0d0d14]" ref={containerRef}>
      {/* Force graph */}
      {dimensions.width > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={(link: object) => {
            const l = link as { risky?: boolean };
            return l.risky ? "rgba(239,68,68,0.5)" : "rgba(148,163,184,0.15)";
          }}
          linkWidth={(link: object) => {
            const l = link as { risky?: boolean };
            return l.risky ? 1.5 : 0.8;
          }}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={(link: object) => {
            const l = link as { risky?: boolean };
            return l.risky ? "rgba(239,68,68,0.7)" : "rgba(148,163,184,0.3)";
          }}
          linkDirectionalParticles={(link: object) => {
            const l = link as { risky?: boolean };
            return l.risky ? 2 : 0;
          }}
          linkDirectionalParticleColor={() => "#ef4444"}
          linkDirectionalParticleSpeed={0.004}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          onNodeHover={(node: object | null) => setHoveredId(node ? (node as GraphNode).id : null)}
          backgroundColor="#0d0d14"
          cooldownTicks={120}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.3}
          nodeLabel={(node: object) => (node as GraphNode).name}
        />
      )}

      {/* Legend + filter */}
      <div className="absolute bottom-4 left-4 bg-[#111118]/90 backdrop-blur border border-[#242430] rounded-lg p-3 space-y-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Node Types</p>
        {LEGEND_ITEMS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className="flex items-center gap-2 w-full group"
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity"
              style={{
                backgroundColor: NODE_COLORS[type],
                opacity: visibleTypes[type] ? 1 : 0.2,
              }}
            />
            <span className={`text-[11px] transition-colors flex-1 text-left ${visibleTypes[type] ? "text-slate-300" : "text-slate-600"}`}>
              {label}
            </span>
            {visibleTypes[type] ? (
              <Eye size={10} className="text-slate-600 group-hover:text-slate-400" />
            ) : (
              <EyeOff size={10} className="text-slate-700 group-hover:text-slate-500" />
            )}
          </button>
        ))}
        <div className="pt-1.5 mt-1.5 border-t border-[#242430] space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-px bg-red-500/60" style={{ borderTop: "1.5px dashed rgba(239,68,68,0.6)" }} />
            <span className="text-[10px] text-slate-600">Risky access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-px bg-slate-600/40" />
            <span className="text-[10px] text-slate-600">Normal access</span>
          </div>
        </div>
      </div>

      {/* Node count badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="bg-[#111118]/80 backdrop-blur border border-[#242430] rounded-md px-2.5 py-1 text-[10px] text-slate-500">
          {filteredNodes.length} nodes · {filteredEdges.length} edges
        </div>
      </div>

      {/* Click hint */}
      {!selectedNodeId && (
        <div className="absolute top-3 right-3 bg-[#111118]/80 backdrop-blur border border-[#242430] rounded-md px-2.5 py-1 text-[10px] text-slate-600 pointer-events-none">
          Click a node to inspect
        </div>
      )}
    </div>
  );
}
