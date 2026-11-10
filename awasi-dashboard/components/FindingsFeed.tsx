"use client";

import { useState } from "react";
import { AlertOctagon, AlertTriangle, Shield, Info, CheckCircle2, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { findings, Finding, Severity } from "@/lib/mockData";

const SEVERITY_CONFIG: Record<Severity, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  critical: {
    icon: <AlertOctagon size={11} />,
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/25",
  },
  high: {
    icon: <AlertTriangle size={11} />,
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/25",
  },
  medium: {
    icon: <Shield size={11} />,
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/25",
  },
  low: {
    icon: <Info size={11} />,
    label: "Low",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/25",
  },
};

const LEFT_BORDER: Record<Severity, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

function FindingCard({ finding }: { finding: Finding }) {
  const [status, setStatus] = useState<"open" | "resolved" | "denied">(finding.status as "open" | "resolved");
  const cfg = SEVERITY_CONFIG[finding.severity];

  const isResolved = status === "resolved";
  const isDenied = status === "denied";

  return (
    <div
      className={`bg-[#111118] border border-[#242430] border-l-2 ${LEFT_BORDER[finding.severity]} rounded-lg p-3.5 transition-opacity ${isResolved || isDenied ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          {(isResolved || isDenied) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 bg-slate-500/10 border border-slate-500/20">
              <CheckCircle2 size={9} />
              {isResolved ? "Resolved" : "Denied"}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-600 whitespace-nowrap">{finding.timestamp}</span>
      </div>

      <p className="text-xs font-medium text-slate-200 leading-snug mb-1">{finding.title}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{finding.description}</p>

      {!isResolved && !isDenied && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatus("resolved")}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-teal-400 bg-teal-400/8 border border-teal-400/20 hover:bg-teal-400/20 transition-colors"
          >
            <ThumbsUp size={10} /> Approve
          </button>
          <button
            onClick={() => setStatus("denied")}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-red-400 bg-red-400/8 border border-red-400/20 hover:bg-red-400/20 transition-colors"
          >
            <ThumbsDown size={10} /> Deny
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-400 bg-slate-400/8 border border-slate-400/20 hover:bg-slate-400/20 transition-colors">
            <Eye size={10} /> Investigate
          </button>
        </div>
      )}
    </div>
  );
}

type FilterSeverity = "all" | Severity;

export function FindingsFeed() {
  const [filter, setFilter] = useState<FilterSeverity>("all");

  const filtered = filter === "all" ? findings : findings.filter((f) => f.severity === filter);
  const openCount = findings.filter((f) => f.status === "open").length;

  const filters: { key: FilterSeverity; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#242430]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Findings</h2>
            <p className="text-xs text-slate-500">{openCount} open issues</p>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                filter === key
                  ? "bg-teal-400/15 border-teal-400/30 text-teal-400"
                  : "bg-transparent border-[#242430] text-slate-500 hover:border-slate-500 hover:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600">
            <Shield size={24} className="mb-2 opacity-40" />
            <p className="text-xs">No findings in this category</p>
          </div>
        ) : (
          filtered.map((f) => <FindingCard key={f.id} finding={f} />)
        )}
      </div>
    </div>
  );
}
