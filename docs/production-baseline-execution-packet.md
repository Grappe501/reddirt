# Production baseline execution packet (REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0)

**Status:** prepared **offline** only — `executionPacketStatus: ready` — **no production mutation** by this packet.

**Machine JSON:** [`data/production-baseline-execution-packet.json`](../data/production-baseline-execution-packet.json) · **Gates:** [`data/production-baseline-approval-gates.json`](../data/production-baseline-approval-gates.json) · **Netlify plan:** [`data/post-baseline-netlify-test-plan.json`](../data/post-baseline-netlify-test-plan.json) · **Validation:** [`data/production-baseline-execution-packet-validation.json`](../data/production-baseline-execution-packet-validation.json) · **Preflight:** [`data/production-baseline-execution-preflight.json`](../data/production-baseline-execution-preflight.json)

**Related:** [`production-baseline-execution-review.md`](./production-baseline-execution-review.md) · [`production-baseline-approval-gates.md`](./production-baseline-approval-gates.md) · [`production-baseline-execution-runbook.md`](./production-baseline-execution-runbook.md) · [`develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md`](../develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md)

---

## Steve gate (every template line)

**DO NOT RUN UNTIL STEVE EXPLICITLY APPROVES PRODUCTION BASELINE EXECUTION.**

Approval phrase (record out-of-band): `STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION`

---

## Checksum / DBA

An existing migration SQL file was edited (checksum drift vs any environment that already recorded the prior migration checksum in _prisma_migrations). Environments with the old checksum may require a governed migration-history resolution path.

---

## Next step

1. `node scripts/validate-production-baseline-execution-packet.mjs`
2. `node scripts/run-production-baseline-execution-preflight.mjs` (requires `DATABASE_URL` / `DIRECT_URL` in env — **never** logged)
3. `node scripts/run-production-baseline-execution-guarded.mjs --dry-run` only from automation
