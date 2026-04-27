# New thread — paste anchor (Kelly SOS / RedDirt)

Use this in a **new** ChatGPT, Claude, or Cursor thread so the model loads the same doctrine and file paths without re-explaining the repo.

---

## Paste block (session preamble)

```
You are assisting on the Kelly Grappe for Arkansas Secretary of State campaign engine: Next.js App Router in RedDirt/ (monorepo path H:\SOSWebsite\RedDirt), Prisma/Postgres, admin workbench. Active product lane: Kelly SOS only; do not import across other SOSWebsite lanes unless Steve approves.

Read in order before proposing build work:
1) RedDirt/docs/THREAD_HANDOFF_MASTER_MAP.md (THREAD-HANDOFF-1)
2) RedDirt/docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md (PROTO-2 + DIV-OPS-1/2)
3) RedDirt/docs/DIVISION_MASTER_REGISTRY.md
4) RedDirt/docs/PROJECT_MASTER_MAP.md

Return format for implementation passes: IMPLEMENTED, FILES, BUILD PROGRESS UPDATE, BLUEPRINT PROGRESS UPDATE, BUILD STEERING DECISION (target division + reason), DIVISION STATUS UPDATE, DRIFT CHECK, CHECKS — as defined in §0.2 of THREAD_HANDOFF_MASTER_MAP.md.

Quality gate from RedDirt/: npm run check. No deletes of production data, no unsourced opponent claims, no real PII in tests, no secrets in docs or commits.
```

---

## Same links (clickable)

1. [THREAD_HANDOFF_MASTER_MAP.md](./THREAD_HANDOFF_MASTER_MAP.md)
2. [BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)
3. [DIVISION_MASTER_REGISTRY.md](./DIVISION_MASTER_REGISTRY.md)
4. [PROJECT_MASTER_MAP.md](./PROJECT_MASTER_MAP.md)

---

## After the thread is live

1. Open the four files above (or `@`-mention them in Cursor).
2. State the **one** packet or task for this pass.
3. Run **`npm run check`** in `RedDirt/` when you touch code, before push.

Last aligned with: `RedDirt/README.md` § New AI thread.
