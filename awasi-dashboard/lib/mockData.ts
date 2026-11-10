export type NodeType = "user" | "agent" | "app" | "datastore";
export type RiskLevel = "critical" | "high" | "medium" | "low" | "none";
export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "resolved";

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  role?: string;
  riskLevel: RiskLevel;
  details: {
    description: string;
    accessCount: number;
    lastActive: string;
    permissions?: string[];
    flags?: string[];
  };
  // force-graph uses x, y, vx, vy internally
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  risky: boolean;
  permission: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  timestamp: string;
  status: FindingStatus;
  relatedNodeIds: string[];
}

// ─── Nodes ──────────────────────────────────────────────────────────────────

export const nodes: GraphNode[] = [
  // Human users (15)
  { id: "u1", name: "Aisha Rahman", type: "user", role: "Staff Engineer", riskLevel: "none", details: { description: "Staff engineer on the platform team.", accessCount: 12, lastActive: "2 min ago", permissions: ["GitHub admin", "AWS read", "Jira write"], flags: [] } },
  { id: "u2", name: "Marcus Teal", type: "user", role: "Senior SWE", riskLevel: "none", details: { description: "Backend engineer, payments team.", accessCount: 9, lastActive: "14 min ago", permissions: ["GitHub write", "Stripe admin", "AWS read"], flags: [] } },
  { id: "u3", name: "Sofia Reyes", type: "user", role: "Product Manager", riskLevel: "none", details: { description: "PM for the core product.", accessCount: 7, lastActive: "1 hr ago", permissions: ["Jira admin", "Notion write", "Salesforce read"], flags: [] } },
  { id: "u4", name: "Daniel Park", type: "user", role: "Sales Lead", riskLevel: "none", details: { description: "Leads enterprise sales.", accessCount: 6, lastActive: "3 hr ago", permissions: ["Salesforce admin", "Notion read"], flags: [] } },
  { id: "u5", name: "Priya Nair", type: "user", role: "Data Scientist", riskLevel: "medium", details: { description: "Works on ML models and analytics.", accessCount: 11, lastActive: "30 min ago", permissions: ["Analytics DB read/write", "GCP read", "GitHub write"], flags: ["Broad DB access"] } },
  { id: "u6", name: "James Wu", type: "user", role: "DevOps Lead", riskLevel: "high", details: { description: "Owns infrastructure and CI/CD.", accessCount: 18, lastActive: "5 min ago", permissions: ["AWS admin", "GCP admin", "GitHub admin"], flags: ["Superuser on 2 clouds", "Shared credential in use"] } },
  { id: "u7", name: "Elena Vasquez", type: "user", role: "Security Engineer", riskLevel: "none", details: { description: "Security team lead.", accessCount: 14, lastActive: "20 min ago", permissions: ["All read", "Audit log access"], flags: [] } },
  { id: "u8", name: "Tom Okafor", type: "user", role: "Frontend Engineer", riskLevel: "none", details: { description: "React/Next.js engineer.", accessCount: 7, lastActive: "2 hr ago", permissions: ["GitHub write", "Jira write", "Vercel admin"], flags: [] } },
  { id: "u9", name: "Nina Larson", type: "user", role: "Customer Success", riskLevel: "none", details: { description: "Manages enterprise accounts.", accessCount: 5, lastActive: "4 hr ago", permissions: ["Salesforce admin", "Zoom admin"], flags: [] } },
  { id: "u10", name: "Raj Mehta", type: "user", role: "CTO", riskLevel: "medium", details: { description: "Chief Technical Officer.", accessCount: 20, lastActive: "45 min ago", permissions: ["GitHub admin", "AWS admin", "GCP admin", "Stripe admin"], flags: ["Broad admin access — shared device"] } },
  { id: "u11", name: "Lisa Chen", type: "user", role: "Finance Manager", riskLevel: "none", details: { description: "Manages financial operations.", accessCount: 4, lastActive: "1 day ago", permissions: ["Stripe read", "Notion write"], flags: [] } },
  { id: "u12", name: "Omar Farouk", type: "user", role: "ML Engineer", riskLevel: "medium", details: { description: "Trains and deploys ML models.", accessCount: 10, lastActive: "1 hr ago", permissions: ["GCP write", "Analytics DB write", "GitHub write"], flags: ["Write access to production DB"] } },
  { id: "u13", name: "Zara Patel", type: "user", role: "Marketing", riskLevel: "none", details: { description: "Growth and demand gen.", accessCount: 3, lastActive: "6 hr ago", permissions: ["Notion write", "Salesforce read"], flags: [] } },
  { id: "u14", name: "Chris Nguyen", type: "user", role: "Support Engineer", riskLevel: "none", details: { description: "Tier 2 customer support.", accessCount: 5, lastActive: "2 hr ago", permissions: ["Jira write", "Salesforce read"], flags: [] } },
  { id: "u15", name: "Amy Kowalski", type: "user", role: "HR Manager", riskLevel: "none", details: { description: "People operations.", accessCount: 3, lastActive: "5 hr ago", permissions: ["Notion write", "Email admin"], flags: [] } },

  // AI agents (10)
  { id: "a1", name: "GPT-4 Coding Agent", type: "agent", riskLevel: "critical", details: { description: "AI agent used for automated code generation and PR reviews.", accessCount: 34, lastActive: "1 min ago", permissions: ["GitHub admin", "Customer DB read", "Code Repos write", "Slack workspace read"], flags: ["Admin GitHub access", "Reads customer PII", "Unreviewed PRs merged"] } },
  { id: "a2", name: "Notion AI", type: "agent", riskLevel: "low", details: { description: "AI writing assistant embedded in Notion.", accessCount: 8, lastActive: "10 min ago", permissions: ["Notion read/write", "Slack workspace read"], flags: [] } },
  { id: "a3", name: "Slack AI", type: "agent", riskLevel: "medium", details: { description: "Slack's native AI assistant and summarizer.", accessCount: 15, lastActive: "3 min ago", permissions: ["Slack workspace read/write", "Email read"], flags: ["Reads all channels including #exec-private"] } },
  { id: "a4", name: "Fireflies.ai Recorder", type: "agent", riskLevel: "high", details: { description: "Meeting recorder and transcription AI.", accessCount: 10, lastActive: "1 hr ago", permissions: ["Zoom admin", "Slack workspace write", "Email write"], flags: ["Posts transcripts to Slack without filtering", "Access to all Zoom meetings"] } },
  { id: "a5", name: "GitHub Copilot", type: "agent", riskLevel: "medium", details: { description: "AI pair programmer in IDE.", accessCount: 20, lastActive: "5 min ago", permissions: ["GitHub write", "Code Repos read", "Customer DB read"], flags: ["Can read secrets in repo"] } },
  { id: "a6", name: "Salesforce Einstein", type: "agent", riskLevel: "low", details: { description: "CRM AI for lead scoring and forecasting.", accessCount: 6, lastActive: "2 hr ago", permissions: ["Salesforce read/write"], flags: [] } },
  { id: "a7", name: "AWS Bedrock Agent", type: "agent", riskLevel: "high", details: { description: "Autonomous AWS task execution agent.", accessCount: 22, lastActive: "8 min ago", permissions: ["AWS admin", "Customer DB read/write", "Analytics DB write"], flags: ["Prod DB write access", "No human-in-the-loop"] } },
  { id: "a8", name: "Jira Automation Bot", type: "agent", riskLevel: "low", details: { description: "Workflow automation for Jira tickets.", accessCount: 5, lastActive: "30 min ago", permissions: ["Jira admin"], flags: [] } },
  { id: "a9", name: "DataRobot MLOps", type: "agent", riskLevel: "medium", details: { description: "Automated ML model deployment and monitoring.", accessCount: 12, lastActive: "4 hr ago", permissions: ["GCP write", "Analytics DB read/write", "Customer DB read"], flags: ["Can trigger model rollouts to prod"] } },
  { id: "a10", name: "Stripe Radar AI", type: "agent", riskLevel: "low", details: { description: "Fraud detection AI on payment transactions.", accessCount: 9, lastActive: "1 min ago", permissions: ["Stripe read"], flags: [] } },

  // Apps/integrations (8)
  { id: "app1", name: "GitHub", type: "app", riskLevel: "medium", details: { description: "Source control and CI/CD.", accessCount: 45, lastActive: "Now", permissions: ["Code Repos read/write"], flags: ["Multiple admin tokens active"] } },
  { id: "app2", name: "Salesforce", type: "app", riskLevel: "none", details: { description: "CRM platform.", accessCount: 20, lastActive: "3 hr ago", permissions: ["Customer data read/write"], flags: [] } },
  { id: "app3", name: "Notion", type: "app", riskLevel: "none", details: { description: "Team wiki and docs.", accessCount: 18, lastActive: "1 hr ago", permissions: ["Internal docs read/write"], flags: [] } },
  { id: "app4", name: "Jira", type: "app", riskLevel: "none", details: { description: "Project and issue tracking.", accessCount: 14, lastActive: "2 hr ago", permissions: ["Ticket read/write"], flags: [] } },
  { id: "app5", name: "Zoom", type: "app", riskLevel: "medium", details: { description: "Video conferencing.", accessCount: 10, lastActive: "30 min ago", permissions: ["Meeting record/admin"], flags: ["All-hands recordings accessible to Fireflies"] } },
  { id: "app6", name: "Stripe", type: "app", riskLevel: "none", details: { description: "Payment processing.", accessCount: 8, lastActive: "5 min ago", permissions: ["Payments read/write"], flags: [] } },
  { id: "app7", name: "AWS", type: "app", riskLevel: "high", details: { description: "Cloud infrastructure (primary).", accessCount: 55, lastActive: "Now", permissions: ["Infra admin", "Data read/write"], flags: ["Overprivileged IAM roles", "Root key not rotated"] } },
  { id: "app8", name: "GCP", type: "app", riskLevel: "medium", details: { description: "Google Cloud (secondary, ML workloads).", accessCount: 30, lastActive: "1 hr ago", permissions: ["ML infra read/write", "BigQuery admin"], flags: ["Service accounts with excess scope"] } },

  // Data stores (5)
  { id: "ds1", name: "Customer DB", type: "datastore", riskLevel: "critical", details: { description: "Primary PostgreSQL database with customer PII and payment metadata.", accessCount: 28, lastActive: "Now", permissions: ["PII data", "Payment metadata"], flags: ["PII", "SOC 2 scope", "AI agents have direct read access"] } },
  { id: "ds2", name: "Analytics DB", type: "datastore", riskLevel: "medium", details: { description: "ClickHouse analytical database with event and behavioral data.", accessCount: 16, lastActive: "2 hr ago", permissions: ["Event data", "Behavioral analytics"], flags: ["Contains derived PII"] } },
  { id: "ds3", name: "Code Repos", type: "datastore", riskLevel: "high", details: { description: "GitHub-hosted code repositories including infrastructure-as-code.", accessCount: 40, lastActive: "Now", permissions: ["Source code", "IaC configs", "CI/CD secrets"], flags: ["Secrets in .env files", "IaC with prod credentials"] } },
  { id: "ds4", name: "Slack Workspace", type: "datastore", riskLevel: "high", details: { description: "Company Slack including private channels and exec comms.", accessCount: 22, lastActive: "2 min ago", permissions: ["All messages", "Files", "Private channels"], flags: ["AI agents read #exec-private", "Unencrypted file shares"] } },
  { id: "ds5", name: "Email (Google Workspace)", type: "datastore", riskLevel: "medium", details: { description: "Corporate email, calendars, and Google Drive.", accessCount: 12, lastActive: "1 hr ago", permissions: ["Email read/write", "Calendar", "Drive"], flags: ["Fireflies AI has write access"] } },
];

// ─── Edges ──────────────────────────────────────────────────────────────────

export const edges: GraphEdge[] = [
  // User → App
  { source: "u1", target: "app1", risky: false, permission: "admin" },
  { source: "u2", target: "app6", risky: false, permission: "admin" },
  { source: "u3", target: "app3", risky: false, permission: "admin" },
  { source: "u4", target: "app2", risky: false, permission: "admin" },
  { source: "u5", target: "app8", risky: false, permission: "read/write" },
  { source: "u6", target: "app7", risky: true, permission: "admin" },
  { source: "u6", target: "app8", risky: true, permission: "admin" },
  { source: "u8", target: "app1", risky: false, permission: "write" },
  { source: "u10", target: "app7", risky: true, permission: "admin" },
  { source: "u12", target: "app8", risky: false, permission: "write" },

  // User → DataStore
  { source: "u5", target: "ds2", risky: false, permission: "read/write" },
  { source: "u12", target: "ds2", risky: true, permission: "write" },
  { source: "u7", target: "ds1", risky: false, permission: "read (audit)" },

  // Agent → App
  { source: "a1", target: "app1", risky: true, permission: "admin" },
  { source: "a2", target: "app3", risky: false, permission: "read/write" },
  { source: "a3", target: "app4", risky: false, permission: "read" },
  { source: "a4", target: "app5", risky: true, permission: "admin" },
  { source: "a5", target: "app1", risky: false, permission: "write" },
  { source: "a6", target: "app2", risky: false, permission: "read/write" },
  { source: "a7", target: "app7", risky: true, permission: "admin" },
  { source: "a8", target: "app4", risky: false, permission: "admin" },
  { source: "a9", target: "app8", risky: false, permission: "write" },
  { source: "a10", target: "app6", risky: false, permission: "read" },

  // Agent → DataStore
  { source: "a1", target: "ds1", risky: true, permission: "read" },
  { source: "a1", target: "ds3", risky: true, permission: "write" },
  { source: "a1", target: "ds4", risky: true, permission: "read" },
  { source: "a3", target: "ds4", risky: true, permission: "read/write" },
  { source: "a3", target: "ds5", risky: true, permission: "read" },
  { source: "a4", target: "ds4", risky: true, permission: "write" },
  { source: "a4", target: "ds5", risky: true, permission: "write" },
  { source: "a5", target: "ds3", risky: false, permission: "read" },
  { source: "a5", target: "ds1", risky: true, permission: "read" },
  { source: "a7", target: "ds1", risky: true, permission: "read/write" },
  { source: "a7", target: "ds2", risky: true, permission: "write" },
  { source: "a9", target: "ds1", risky: true, permission: "read" },
  { source: "a9", target: "ds2", risky: false, permission: "read/write" },

  // App → DataStore
  { source: "app1", target: "ds3", risky: false, permission: "admin" },
  { source: "app7", target: "ds1", risky: false, permission: "admin" },
  { source: "app8", target: "ds2", risky: false, permission: "admin" },
];

// ─── Findings ──────────────────────────────────────────────────────────────

export const findings: Finding[] = [
  {
    id: "f1",
    severity: "critical",
    title: "AI agent has write access to production customer database",
    description: "GPT-4 Coding Agent holds direct read access to the Customer DB (PII, payment metadata) with no data minimization controls. This violates least-privilege and places SOC 2 compliance at risk.",
    timestamp: "2 min ago",
    status: "open",
    relatedNodeIds: ["a1", "ds1"],
  },
  {
    id: "f2",
    severity: "critical",
    title: "AWS Bedrock Agent has admin-level cloud access with no human oversight",
    description: "AWS Bedrock Agent operates with full AWS admin permissions and can read/write the production Customer DB autonomously. No approval gate exists for high-impact actions.",
    timestamp: "18 min ago",
    status: "open",
    relatedNodeIds: ["a7", "app7", "ds1"],
  },
  {
    id: "f3",
    severity: "high",
    title: "Meeting recorder AI posting unfiltered transcripts to Slack",
    description: "Fireflies.ai has Zoom admin access and writes raw transcripts — including exec calls — to Slack channels without any PII scrubbing or access control on the destination channel.",
    timestamp: "1 hr ago",
    status: "open",
    relatedNodeIds: ["a4", "app5", "ds4"],
  },
  {
    id: "f4",
    severity: "high",
    title: "Slack AI reads private executive channels",
    description: "Slack AI is authorized to read all channels including #exec-private and #board-updates. Its training and summarization pipeline has no channel-scoped access restrictions.",
    timestamp: "3 hr ago",
    status: "open",
    relatedNodeIds: ["a3", "ds4"],
  },
  {
    id: "f5",
    severity: "high",
    title: "GitHub Copilot can read secrets from code repositories",
    description: "GitHub Copilot has read access to repositories that contain hardcoded secrets in .env files and IaC configs. These secrets are in Copilot's training context window.",
    timestamp: "5 hr ago",
    status: "open",
    relatedNodeIds: ["a5", "ds3"],
  },
  {
    id: "f6",
    severity: "medium",
    title: "DevOps lead holds simultaneous admin keys on AWS and GCP",
    description: "James Wu holds admin credentials on both AWS and GCP simultaneously. A credential compromise would result in full multi-cloud access. Credential rotation is overdue by 47 days.",
    timestamp: "1 day ago",
    status: "open",
    relatedNodeIds: ["u6", "app7", "app8"],
  },
  {
    id: "f7",
    severity: "medium",
    title: "GPT-4 Coding Agent merging PRs without human review",
    description: "Branch protection rules on 3 repos allow the GPT-4 coding agent to merge pull requests autonomously when CI passes, bypassing required human approval.",
    timestamp: "2 day ago",
    status: "resolved",
    relatedNodeIds: ["a1", "app1", "ds3"],
  },
  {
    id: "f8",
    severity: "low",
    title: "Jira Automation Bot has stale admin token",
    description: "The Jira Automation Bot is using an API token generated 180 days ago. Token rotation policy requires 90-day rotation. No anomalous activity detected.",
    timestamp: "3 day ago",
    status: "open",
    relatedNodeIds: ["a8", "app4"],
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────────

export const stats = {
  totalIdentities: nodes.filter((n) => n.type === "user" || n.type === "agent").length,
  activeAgents: nodes.filter((n) => n.type === "agent").length,
  openFindings: findings.filter((f) => f.status === "open").length,
  integrationsConnected: nodes.filter((n) => n.type === "app").length,
  criticalFindings: findings.filter((f) => f.severity === "critical" && f.status === "open").length,
  riskyEdges: edges.filter((e) => e.risky).length,
};
