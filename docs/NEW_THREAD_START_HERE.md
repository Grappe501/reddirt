# New thread — paste anchor (Kelly SOS / RedDirt)

Use this in a **new** ChatGPT, Claude, or Cursor thread so the model loads the same doctrine and file paths without re-explaining the repo.

---

## Paste block (session preamble)

```
You are assisting on the Kelly Grappe for Arkansas Secretary of State campaign engine: Next.js App Router in RedDirt/ (monorepo path H:\SOSWebsite\RedDirt), Prisma/Postgres, admin workbench. Active product lane: Kelly SOS only; do not import across other SOSWebsite lanes unless Steve approves.

Read in order before proposing build work:
0) RedDirt/docs/ERNIE_CAMPAIGN_OS_WORK_PROTOCOL.md — role, north star, held phases (Ernie/Burt)
0b) RedDirt/docs/campaign-events/ORCHESTRATION_PHASE_2A_LIVE_CAMPAIGN_STATE_HANDOFF.md — live CampaignState API
1) RedDirt/docs/THREAD_HANDOFF_MASTER_MAP.md (THREAD-HANDOFF-1)
2) RedDirt/docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md (PROTO-2 + DIV-OPS-1/2)
3) RedDirt/docs/DIVISION_MASTER_REGISTRY.md
4) RedDirt/docs/PROJECT_MASTER_MAP.md
5) Campaign OS master build (Sprint 0–10): RedDirt/docs/campaign-events/MASTER_CAMPAIGN_OS_ROADMAP.md · BUILD_SPRINT_STATUS.md · AI_AGENT_TOOL_BUILD_MAP.md · SYSTEM_DEPENDENCY_GRAPH.md

Return format for implementation passes: IMPLEMENTED, FILES, BUILD PROGRESS UPDATE, BLUEPRINT PROGRESS UPDATE, BUILD STEERING DECISION (target division + reason), DIVISION STATUS UPDATE, DRIFT CHECK, CHECKS — as defined in §0.2 of THREAD_HANDOFF_MASTER_MAP.md.

Quality gate from RedDirt/: npm run check. No deletes of production data, no unsourced opponent claims, no real PII in tests, no secrets in docs or commits.
```

---

## Same links (clickable)

0. [THREAD_MIGRATION_HANDOFF_2026-05-22.md](./THREAD_MIGRATION_HANDOFF_2026-05-22.md) — **start here after a long thread**
1. [THREAD_HANDOFF_MASTER_MAP.md](./THREAD_HANDOFF_MASTER_MAP.md)
2. [BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)
3. [DIVISION_MASTER_REGISTRY.md](./DIVISION_MASTER_REGISTRY.md)
4. [PROJECT_MASTER_MAP.md](./PROJECT_MASTER_MAP.md)
5. Campaign OS: [MASTER_CAMPAIGN_OS_ROADMAP.md](./campaign-events/MASTER_CAMPAIGN_OS_ROADMAP.md) · [BUILD_SPRINT_STATUS.md](./campaign-events/BUILD_SPRINT_STATUS.md)

---

## After the thread is live

1. Open the four files above (or `@`-mention them in Cursor).
2. State the **one** packet or task for this pass.
3. Run **`npm run check`** in `RedDirt/` when you touch code, before push.

Last aligned with: `RedDirt/README.md` § New AI thread.
