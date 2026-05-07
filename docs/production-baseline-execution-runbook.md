# Production baseline execution runbook (REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0)

## Order of operations

1. **Validate packet:** `node scripts/validate-production-baseline-execution-packet.mjs`
2. **Preflight:** `node scripts/run-production-baseline-execution-preflight.mjs` (checks env presence + URL shape only — **does not** print secrets)
3. **Gates:** satisfy every gate in [`production-baseline-approval-gates.md`](./production-baseline-approval-gates.md)
4. **Guarded (dry-run only from CI):** `node scripts/run-production-baseline-execution-guarded.mjs --dry-run`
5. **Manual execution:** operator runs `npx prisma validate` then `npx prisma migrate deploy` in a **separate** approved terminal — this repo’s guarded script **does not** invoke Prisma.

## Steve gate

**DO NOT RUN UNTIL STEVE EXPLICITLY APPROVES PRODUCTION BASELINE EXECUTION.**

No production Prisma without backup proof, correct DB, and recorded approval phrase.
