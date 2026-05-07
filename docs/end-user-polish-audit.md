# End-user polish audit — RedDirt

Slice: **REDDIRT-END-USER-POLISH-AND-JARGON-CLEANUP-1.0** (May 2026)

## Goal

Remove developer-facing and proof-first language from **user-visible** public and admin UI so the product reads as a campaign operating system, not a build log.

## What changed (summary)

- **Communication Command Center** is the primary label for admin chrome, navigation, and back-links (URLs under `/admin/workbench/email-command-center` unchanged).
- **Hosted diagnostics** page now maps technical table/route keys to plain English labels; safety rows use “locked = good” framing where appropriate.
- **Readiness checklist**, **live database connection helper**, and **cockpit** copy were rewritten to plain campaign/staff language while preserving no-send posture.
- **Governance bullets** in the email cockpit snapshot (`read-model.ts`) were rewritten for humans; migration gate notes softened without changing gate logic.
- **Public site** removed visible `TODO:` lines on get-involved, local team, bring-5, integrity tour request, county fairs map caption, and invite-Kelly form helper text.
- **Organizing intelligence** preview pages: removed “packet” / internal placeholder tone from visible paragraphs and metadata descriptions.

## Intentionally unchanged

- JSON/API field names and database identifiers.
- Non-rendered `TODO` comments in source files.
- Prisma schema, migrations, `.env`, and safety constants.

## Deliverables

| Artifact | Path |
|----------|------|
| Machine-readable audit | `data/end-user-polish-audit.json` |
| This summary | `docs/end-user-polish-audit.md` |
| Full slice report | `develop_notes/REDDIRT_END_USER_POLISH_AND_JARGON_CLEANUP_1_0_REPORT.md` |

## Follow-up (not done in this slice)

- Further soften remaining **IntegrationColumn** “exists today” bullets in `EmailCommandCenterContent.tsx` if operators want even less env jargon.
- Optional: rename route folders from `email-command-center` to a neutral path (risky; deferred).
