# Cursor script — Phase 7: Google Drive

Active lane: RedDirt (worktree `H:\SOSWebsite\RedDirt-contact-intel`)
Branch: `feat/contact-intelligence-v1`
Phase: 7 — Google Drive ingest
One objective: Connect multiple Drive accounts with least privilege, discover candidate contact files, and reuse the Phase 2 pipeline.

Allowed paths:
- `src/lib/contact-intel/google-drive/**`
- `src/app/admin/contact-intel/sources/**`
- additive Prisma source-account tables if required
- `docs/contact-intelligence/**`

Forbidden:
- Drive write/delete scopes
- Auto-ingest
- Tokens in git
- Treating Drive docs as trusted contacts without mapping/preview
- C: scratch; other lanes; sends

Reuse: existing Google OAuth patterns in RedDirt if they already exist; Phase 2 commit machinery.

Steps:
1. Explicit per-account connect.
2. List candidate csv/xlsx in authorized folders only.
3. Operator picks a file → Phase 2 job.
4. Record source account + file id on the import job.

Acceptance: two accounts can be connected; a file is imported only after mapping preview; disconnect does not delete people.

Stop if: OAuth would require write scopes, or tokens cannot be stored without a new secret-handling design.
