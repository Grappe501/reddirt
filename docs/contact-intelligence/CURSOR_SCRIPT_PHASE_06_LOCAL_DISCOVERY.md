# Cursor script — Phase 6: local folder discovery

Active lane: RedDirt (worktree `H:\SOSWebsite\RedDirt-contact-intel`)
Branch: `feat/contact-intelligence-v1`
Phase: 6 — Local discovery
One objective: Scan operator-selected folders on H: for likely contact files, preview them, and require approval before ingest.

Allowed paths:
- `src/lib/contact-intel/discovery/**`
- `src/app/admin/contact-intel/sources/**`
- `docs/contact-intelligence/**`

Forbidden:
- Scanning `C:\Users`, `C:\Windows`, or any path not explicitly listed by the operator
- Writing discovered files to C: temp
- Auto-commit
- Google APIs
- Other lanes

Reuse: Phase 2 parse/map/preview/commit; H: `.local` for any cache index.

Steps:
1. Operator pastes/selects one or more H: folder paths.
2. Classify csv/xlsx/vcf/likely contact filenames.
3. Skip unchanged files via hash.
4. Preview list; operator picks files; those enter Phase 2 import jobs.

Acceptance: a selected H: test folder with a synthetic CSV is listed; an unselected folder is not touched; ingest still requires mapping + commit.

Verify: typecheck + a documented dry-run against `H:\SOSWebsite\.local\contact-intel-fixtures` (synthetic files only).

Stop if: the scanner would need to crawl the whole user profile, or temp files land on C:.
