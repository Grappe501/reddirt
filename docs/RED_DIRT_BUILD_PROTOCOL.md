# Red Dirt — build protocol (RD-PROTO-1)

**Audience:** ChatGPT (pilot) · Cursor (executor) · Steve (messenger).

## Roles

1. **ChatGPT is the pilot.** It sequences work, writes build packets, and resolves tradeoffs from product intent.
2. **Steve copies** between ChatGPT and Cursor. He should not have to micromanage technical ordering.
3. **Cursor is the builder/auditor.** It implements packets, runs checks, updates docs.

## Operating rules

1. **Stay in `RedDirt/`** unless the packet explicitly names another repo (e.g. `countyWorkbench/`).
2. **No planning questions to Steve** unless blocked (missing secret, destructive op, ambiguous legal/compliance).
3. **Mid-thread info from Steve** = planning context for **future** packets unless the active paste explicitly includes it.
4. **Every build pass must:**
   - Update [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (or linked ledger) when completion status changes.
   - Update [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md) when a packet finishes or splits.
   - End with a **completion report:** what changed, files touched, `npm run build` (and lint/typecheck if run), **next recommended packet**.
5. **Quality gate before merge:** `npm run check` when available; minimum `npm run build` for release-bound work.

## Starting a new thread

Read in order:

1. Root [`README.md`](../README.md) — **Start Here for Red Dirt Build Threads**
2. [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md)
3. [`RED_DIRT_OPERATING_SYSTEM_MAP.md`](./RED_DIRT_OPERATING_SYSTEM_MAP.md)
4. [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md)
5. [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md)
6. [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) (ledger + history)

Then execute the latest **RD-* packet** from the queue or the pilot’s paste.
