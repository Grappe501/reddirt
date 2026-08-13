# Cursor script — Phase 5: addresses, tags, custom fields

Active lane: RedDirt (worktree `H:\SOSWebsite\RedDirt-contact-intel`)
Branch: `feat/contact-intelligence-v1`
Phase: 5 — Schema expansion
One objective: Let operators map extra spreadsheet columns to addresses, tags, or reusable custom fields without rebuilding the database.

Allowed paths:
- `prisma/schema.prisma` (additive only)
- `prisma/migrations/2026*` new folder after latest existing timestamp
- `src/lib/contact-intel/**`
- `src/app/admin/contact-intel/**`
- `docs/contact-intelligence/**`

Forbidden:
- C: scratch; other lanes; EmailContactProfile / RelationalContact / User bulk writes; sends; Google; local disk scanners; refactors; changing v1 match rules

Reuse: existing env, `requireAdmin*`, `normalizeEmail`, `normalizePhone`, mapping UI, `run-with-h-drive-env.cjs`

Steps:
1. Add `ContactIntelAddress`, `ContactIntelTag`, `ContactIntelCustomFieldDefinition`, `ContactIntelCustomFieldValue`.
2. Extend mapping targets: `address`, `city`, `state`, `zip`, `tag`, `custom:<key>`.
3. Unmapped extras still stay in `rawJson`.
4. Show new values on the person page.
5. `npm run stack:migrate` then typecheck.

Acceptance:
1. A sheet with an extra `Employer` column can create a reusable custom field and attach it to people.
2. Existing email/phone uniqueness still holds.
3. No send paths added.

Verify: `npm run stack:migrate` · `npm run typecheck` · synthetic CSV without real PII.

Stop if: migrate fails twice; secrets appear; would require rewriting ContactIntelMethod uniqueness.

Completion report: files, migration name, tests, limitations.
