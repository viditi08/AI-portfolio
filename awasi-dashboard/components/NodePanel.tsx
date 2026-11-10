"use client";

import { X, User, Bot, Plug, Database, AlertTriangle, ShieldCheck, Shield, AlertOctagon } from "lucide-react";
import { GraphNode, NodeType, RiskLevel } from "@/lib/mockData";

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  user: <User size={16} />,
  agent: <Bot size={16} />,
  app: <Plug size={16} />,
  datastore: <Database size={16} />,
};

const NODE_LABELS: Record<NodeType, string> = {
  user: "Human User",
  agent: "AI Agent",
  app: "Integration",
  datastore: "Data Store",
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; icon: React.ReactNode }> = {
  critical: { label: "Critical Risk", color: "text-red-400 bg-red-400/10 border-red-400/30", icon: <AlertOctagon size={12} /> },
  high: { label: "High Risk", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", icon: <AlertTriangle size={12} /> },
  medium: { label: "Medium Risk", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", icon: <Shield size={12} /> },
  low: { label: "Low Risk", color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: <Shield size={12} /> },
  none: { label: "No Issues", color: "text-teal-400 bg-teal-400/10 border-teal-400/30", icon: <ShieldCheck size={12} /> },
};

const NODE_COLOR: Record<NodeType, string> = {
  user: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  agent: "bg-violet-500/20 border-violet-500/40 text-violet-300",
  app: "bg-teal-500/20 border-teal-500/40 text-teal-300",
  datastore: "bg-amber-500/20 border-amber-500/40 text-amber-300",
};

interface NodePanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodePanel({ node, onClose }: NodePanelProps) {
  if (!node) return null;

  const risk = RISK_CONFIG[node.riskLevel];

  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-[#111118] border-l border-[#242430] flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-[#242430]">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-md border ${NODE_COLOR[node.type]} shrink-0`}>
            {NODE_ICONS[node.type]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{node.name}</p>
            <p className="text-xs text-slate-500">{NODE_LABELS[node.type]}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-white/5 shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Role */}
        {node.role && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Role</p>
            <p className="text-sm text-slate-300">{node.role}</p>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-slate-400 leading-relaxed">{node.details.description}</p>
        </div>

        {/* Risk badge */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Risk Level</p>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${risk.color}`}>
            {risk.icon}
            {risk.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#18181f] rounded-md p-2.5 border border-[#242430]">
            <p className="text-lg font-semibold text-slate-100 tabular-nums">{node.details.accessCount}</p>
            <p className="text-xs text-slate-500">Access paths</p>
          </div>
          <div className="bg-[#18181f] rounded-md p-2.5 border border-[#242430]">
            <p className="text-xs font-medium text-teal-400 truncate">{node.details.lastActive}</p>
            <p className="text-xs text-slate-500">Last active</p>
          </div>
        </div>

        {/* Permissions */}
        {node.details.permissions && node.details.permissions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Permissions</p>
            <div className="space-y-1">
              {node.details.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60 shrink-0" />
                  <span className="text-slate-300">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk flags */}
        {node.details.flags && node.details.flags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Risk Flags</p>
            <div className="space-y-1.5">
              {node.details.flags.map((flag) => (
                <div key={flag} className="flex items-start gap-2 text-xs bg-red-400/5 border border-red-400/15 rounded-md px-2.5 py-2">
                  <AlertTriangle size={11} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-300">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-[#242430] flex gap-2">
        <button className="flex-1 py-1.5 px-3 rounded-md bg-teal-400/10 border border-teal-400/20 text-teal-400 text-xs font-medium hover:bg-teal-400/20 transition-colors">
          Investigate
        </button>
        <button className="flex-1 py-1.5 px-3 rounded-md bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-colors">
          Revoke Access
        </button>
      </div>
    </div>
  );
}
