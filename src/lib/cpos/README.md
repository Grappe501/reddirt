# CPOS (`src/lib/cpos`)

**Status:** Planned — implement per [`docs/cpos/CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md`](../../docs/cpos/CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md).

**First slice:** CPOS-1 — `schemas/meeting-manifest.ts` (Zod) + `npm run cpos:validate-manifest`.

**Manifest seed:** [`data/cpos/manifests/kickoff-2026.yaml`](../../data/cpos/manifests/kickoff-2026.yaml)

**Session sync v1:** polling only — see `session-sync/transport.ts` interface in IA doc.
