"use client";

import { useState } from "react";
import { Shield, ChevronRight, Bell, Settings, Search, LayoutGrid, List } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";
import { AccessGraph } from "@/components/AccessGraph";
import { NodePanel } from "@/components/NodePanel";
import { FindingsFeed } from "@/components/FindingsFeed";
import { GraphNode } from "@/lib/mockData";
import { findings } from "@/lib/mockData";

type Tab = "graph" | "findings";

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("graph");

  const openFindings = findings.filter((f) => f.status === "open").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] overflow-hidden">
      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[#242430] bg-[#0d0d14]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
              <Shield size={13} className="text-teal-400" />
            </div>
            <span className="font-semibold text-sm text-slate-100 tracking-tight">awasi</span>
            <span className="text-slate-700 mx-1">/</span>
            <span className="text-sm text-slate-400">Access Intelligence</span>
          </div>
          <div className="flex items-center gap-0.5 text-slate-600">
            <ChevronRight size={12} />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-[#18181f] border border-[#242430] rounded-md px-2 py-1">
            <span>acme-corp</span>
            <span className="text-slate-700">·</span>
            <span className="text-teal-400/70">live</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#18181f] border border-[#242430] text-slate-500 text-xs hover:border-slate-500 hover:text-slate-300 transition-colors">
            <Search size={12} />
            <span className="hidden sm:inline">Search</span>
            <span className="hidden sm:inline text-slate-700">⌘K</span>
          </button>
          <button className="relative p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <Bell size={15} />
            {openFindings > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
          <button className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <Settings size={15} />
          </button>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white ml-1">
            AK
          </div>
        </div>
      </header>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-b border-[#242430] bg-[#0d0d14]">
        <StatsBar />
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-[#242430] bg-[#0d0d14]">
        <button
          onClick={() => setActiveTab("graph")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "graph"
              ? "bg-teal-400/10 border border-teal-400/20 text-teal-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
          }`}
        >
          <LayoutGrid size={12} />
          Access Graph
        </button>
        <button
          onClick={() => setActiveTab("findings")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
            activeTab === "findings"
              ? "bg-teal-400/10 border border-teal-400/20 text-teal-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
          }`}
        >
          <List size={12} />
          Findings
          {openFindings > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/25">
              {openFindings}
            </span>
          )}
        </button>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeTab === "graph" ? (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Graph area */}
            <div className="flex-1 relative graph-container overflow-hidden min-w-0">
              <AccessGraph
                onNodeClick={setSelectedNode}
                selectedNodeId={selectedNode?.id ?? null}
              />
            </div>
            {/* Side panel (conditionally shown) */}
            {selectedNode && (
              <div className="w-72 shrink-0 relative border-l border-[#242430]">
                <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
              </div>
            )}
          </div>
        ) : (
          /* Findings feed — full width on mobile, constrained on desktop */
          <div className="flex-1 overflow-hidden max-w-2xl mx-auto w-full">
            <FindingsFeed />
          </div>
        )}
      </div>
    </div>
  );
}
