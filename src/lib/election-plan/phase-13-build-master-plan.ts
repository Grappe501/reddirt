export const PHASE_13_BUILD_MASTER_PLAN = {
  title: "Phase 13 — Forward Motion Build Plan",
  subtitle: "Sub-phases to finish announce · promote · activate upcoming stops",
  intro:
    "Phase 13 turns verified upcoming stops into activation packages (Mobilize, Facebook, press, graphics, phone, postcards, story capture). Phase 12 proves where Kelly has been; Phase 13 shows where she is going next. Everything stays draft/review until leadership approves public release.",
  hardRules: [
    "No live emails, Facebook posts, Mobilize publish, or press distribution from generated artifacts",
    "No voter-level PII",
    "No 20-week calendar lock from this system",
    "Human approval before any public release",
  ],
  phases: [
    {
      id: "13-0",
      title: "Phase 13.0 — Data foundation",
      status: "complete" as const,
      items: [
        "Build script: npm run campaign-brain:forward-motion",
        "Activation queue JSON (~79 stops / 90d)",
        "Draft markdown for news, Facebook, Mobilize, phone, postcards",
        "Election plan Forward Motion tab (summary table)",
      ],
    },
    {
      id: "13-1",
      title: "Phase 13.1 — Calendar Truth gate",
      status: "in_progress" as const,
      items: [
        "Declined events excluded via event-approvals source",
        "Verified-only stops in priority window",
        "Queue eventId reconciled with campaign calendar",
        "Weekly SOP: approve → rebuild forward motion",
      ],
    },
    {
      id: "13-2",
      title: "Phase 13.2 — Stop command center",
      status: "complete" as const,
      items: [
        "Route /election-plan/forward-motion/[eventId] (+ human slug alias)",
        "Stop readiness score: promotion · coalition · volunteers · story · house parties · endorsements",
        "County + city brief binding, coalition targets, promotion timeline, Po5 + house party engine",
        "Links from Forward Motion tab, intelligence opportunities, and War Room story rollup",
      ],
    },
    {
      id: "13-3",
      title: "Phase 13.3 — Draft artifact browser",
      status: "pending" as const,
      items: [
        "In-app links to news release, Facebook, Mobilize drafts",
        "Graphics + phone + postcard queues per stop",
        "Optional inline markdown preview for comms review",
      ],
    },
    {
      id: "13-4",
      title: "Phase 13.4 — Operator approval workflow",
      status: "pending" as const,
      items: [
        "forward-motion-approvals.source.json for human status overrides",
        "Build merge into activation queue",
        "Approval badges on stop drill-down",
      ],
    },
    {
      id: "13-5",
      title: "Phase 13.5 — Weekly packet in-app",
      status: "pending" as const,
      items: [
        "Kelly / surrogate / county team next-7-day sections in election plan",
        "Missing promotion checklist for Monday stand-up",
        "War room readiness rollup",
      ],
    },
    {
      id: "13-6",
      title: "Phase 13.6 — Phase 12 handoff",
      status: "pending" as const,
      items: [
        "Pre-stop story capture brief linked per event",
        "Post-event prompt → motion storytelling pipeline",
        "Social Resume / Presence Map cross-links",
      ],
    },
    {
      id: "13-7",
      title: "Phase 13.7 — Geography binding",
      status: "pending" as const,
      items: [
        "County playbook link on every stop",
        "City location brief when in Top 40",
        "County registration + visit coverage context",
      ],
    },
    {
      id: "13-8",
      title: "Phase 13.8 — Canvass & door hangers",
      status: "pending" as const,
      items: [
        "Keep future status until field OS ready",
        "Turf hook from county workbench when available",
        "Door hanger brief for high-score rural stops",
      ],
    },
    {
      id: "13-9",
      title: "Phase 13.9 — Production cadence",
      status: "pending" as const,
      items: [
        "Weekly rebuild checklist for field + comms",
        "≥60% avg readiness for next-7-day Kelly stops",
        "Definition of done sign-off",
      ],
    },
  ],
  buildOrder: [
    "13.2 Stop drill-down",
    "13.1 Calendar Truth gate",
    "13.3 Draft artifact links",
    "13.4 Approval workflow",
    "13.5 Weekly packet UI",
    "13.7 County/city binding",
    "13.6 Phase 12 handoff",
    "13.8 Canvass layer",
    "13.9 Production cadence",
  ],
  commands: [
    "npm run campaign-brain:forward-motion",
    "npm run campaign-brain:build",
    "npm run election-plan:build",
  ],
  docPath: "docs/campaign-brain/forward-motion/PHASE-13-BUILD-MASTER-PLAN.md",
};

export function phase13MasterPlanHref(): string {
  return "/election-plan/forward-motion/master-plan";
}
