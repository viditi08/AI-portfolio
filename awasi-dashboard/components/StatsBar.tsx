"use client";

import { Users, Bot, AlertTriangle, Plug, ShieldAlert, GitMerge } from "lucide-react";
import { stats } from "@/lib/mockData";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "teal" | "red" | "amber" | "slate";
  pulse?: boolean;
}

function StatCard({ icon, label, value, accent = "slate", pulse }: StatCardProps) {
  const accentClasses = {
    teal: "text-teal-400 bg-teal-400/10",
    red: "text-red-400 bg-red-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    slate: "text-slate-400 bg-slate-400/10",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#111118] border border-[#242430] hover:border-[#2dd4bf]/30 transition-colors min-w-0">
      <div className={`p-1.5 rounded-md shrink-0 ${accentClasses[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-slate-100 tabular-nums">{value}</span>
          {pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}

export function StatsBar() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <StatCard
        icon={<Users size={14} />}
        label="Total Identities"
        value={stats.totalIdentities}
        accent="teal"
      />
      <StatCard
        icon={<Bot size={14} />}
        label="Active AI Agents"
        value={stats.activeAgents}
        accent="teal"
      />
      <StatCard
        icon={<AlertTriangle size={14} />}
        label="Open Findings"
        value={stats.openFindings}
        accent="red"
        pulse
      />
      <StatCard
        icon={<ShieldAlert size={14} />}
        label="Critical Issues"
        value={stats.criticalFindings}
        accent="red"
      />
      <StatCard
        icon={<GitMerge size={14} />}
        label="Risky Connections"
        value={stats.riskyEdges}
        accent="amber"
      />
      <StatCard
        icon={<Plug size={14} />}
        label="Integrations"
        value={stats.integrationsConnected}
        accent="slate"
      />
    </div>
  );
}
