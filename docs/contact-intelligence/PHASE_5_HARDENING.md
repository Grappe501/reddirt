# Phase 5 — MVP hardening

**Date:** 2026-08-13  
**Worktree:** `H:\SOSWebsite\RedDirt-contact-intel`  
**Branch:** `feat/contact-intelligence-v1`  
**Steve override:** Phase 5 is hardening the live importer, not addresses/tags/custom fields.

## Entry points

| Step | Module |
|------|--------|
| Upload | `src/app/admin/contact-intel-actions.ts` → `createContactIntelImportJob` |
| Preview | `previewContactIntelMappingAction` → `applyContactIntelMappingAndPreview` |
| Commit | `commitContactIntelImportAction` → `commitContactIntelImport` |
| Search | `src/lib/contact-intel/queries.ts` → `/admin/contact-intel` |
| Classify | `src/lib/contact-intel/classify.ts` (shared by preview and commit) |
| Normalize | `normalizeEmail` + import-only `normalizeContactIntelPhone` |
| Parse | `src/lib/contact-intel/parse.ts` |

## Transaction boundary

- Upload: job + source rows in one `$transaction`.
- Preview: staging classification on `ContactIntelSourceRow` + job `PREVIEWED`. Does **not** create people or methods.
- Commit: people, methods, conflicts, row personIds, and job `COMMITTED` in one `$transaction` (60s). On failure the job is marked `FAILED`; that attempt’s people/methods are not kept.

## Test framework

No `npm test` / Jest / Vitest. Checkers:

- `npm run contact-intel:normalize-check`
- `npm run contact-intel:harden-check`

`DATABASE_URL` is the live RedDirt Postgres. Persistence tests are **not** run against it. Transaction safety is asserted by source scan + isolated classification replay.

## Defects closed in this phase

1. Commit was not transactional — now `$transaction`.
2. Unknown extensions parsed as CSV — allowlist only.
3. Filenames not sanitized — `sanitizeContactIntelFilename`.
4. Duplicate headers silently overwrote — rejected.
5. More than 20,000 rows silently truncated — rejected.
6. Shared `normalizePhone` last-10-of-junk — import uses stricter helper.
7. Preview and commit classification could drift — single `classifyContactIntelRows`.
8. `E-mail Address` headers were ignored — guesser now treats `e mail` / `e-mail`.
9. CSV bytes with an `.xlsx` extension could be parsed by SheetJS — rejected unless the file looks like ZIP/OLE.
