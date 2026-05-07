# REDDIRT_END_USER_POLISH_AND_JARGON_CLEANUP_1_0_REPORT

## 1. Slice summary

User-facing and admin-facing copy pass across RedDirt: replaced “Email Command Center” product chrome with **Communication Command Center**, humanized hosted diagnostics and readiness surfaces, softened migration/packet language in the messaging cockpit read-model and UI, removed visible public `TODO` lines, and polished organizing-intelligence preview pages. No database, migration, auth, or send-gate logic was changed.

## 2. Files changed

See `data/end-user-polish-audit.json` → `filesChangedPrimary` for the authoritative list. Notable clusters:

- `src/lib/communication-command-center/readiness.ts` — exported human labels for tables/routes; friendlier `nextRecommendedStep` string; exported `CommunicationCommandCenterRouteContractKey`.
- `src/app/admin/(board)/workbench/communication-command-center/readiness/page.tsx` — plain labels, inverted safety row semantics where “off” is good.
- `src/components/admin/email-command-center/*` — large cockpit/readiness/hosted-helper polish.
- `src/lib/email-command-center/read-model.ts` — governance bullets, migration hints, contact import labels.
- Public `(site)` pages and `organizing-intelligence` placeholders.
- `src/components/admin/AdminBoardShell.tsx`, `src/app/admin/(board)/page.tsx` — nav and dashboard card copy.

## 3. Public pages reviewed

Touched in this pass:

- `/get-involved`, `/start-a-local-team`, `/get-involved/bring-5`
- `/events/community-election-integrity-tour/request`
- `/events/county-fairs` (visible caption)
- `/events/request/what-you-can-host` (form helper)
- `/organizing-intelligence/regions/[slug]`, `/organizing-intelligence/counties/[countySlug]`

Other public routes were covered by prior grep inventory; many `TODO` instances live only inside HTML comments and were left as non-UI.

## 4. Admin / workbench pages reviewed

- Communication Command Center cockpit (`EmailCommandCenterContent.tsx`)
- Readiness checklist (`EmailCommandCenterReadinessView.tsx`)
- Live database connection helper (`HostedDbReadinessAssistantView.tsx`)
- Hosted diagnostics (`communication-command-center/readiness/page.tsx`)
- Admin board shell + admin dashboard intro card
- Back-links on audiences, profiles, sendgrid, imports, gmail, Message Studio, Route map, Automation, Analytics, Send execution governance

## 5. Navigation changes

- **AdminBoardShell**: “Email Command Center” → “Communication Command Center”.
- **Admin dashboard** (`/admin`): card title and link text aligned to Communication Command Center.

## 6. Jargon removed (examples)

- Slice/packet IDs in headers (e.g. `EMAIL-*-1.0` monikers) from primary readiness and cockpit paragraphs.
- “Canonical”, “operator packet”, “migration” phrasing in user-visible banners where replaced with “live campaign database”, “staff”, “workspace/database updates”.
- Raw `canSendFromEmailWorkflowItem = false` replaced with “Queue-triggered send … Locked (expected)”.

## 7. Jargon intentionally retained (and why)

- **Code and types**: Prisma client imports, `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` constant name, table/model names.
- **API JSON**: Readiness payload keys such as `productionCanonical`, `WorkflowIntake` (table existence checks), `routes` keys — scripts and contracts depend on stable keys; UI now maps keys to labels on the diagnostics page.
- **Actionable CLI hints**: `npm run …` strings remain where staff must run exact commands.
- **Deep cockpit lists**: Some env var names remain in Gmail status strings where operators must fix specific variables.

## 8. No-send / safety copy updates

- Cockpit top banner: “No live sending from here” + plain explanation; queue send remains off until headquarters enables.
- Hosted diagnostics: safety section explains green = locked/safe for outbound channels.
- Governance list in read-model rewritten without removing substance (webhook signing, staging imports, no auto-send).

## 9. Accessibility / contrast notes

- No intentional color-token changes; diagnostics page still uses emerald/rose for pass/fail with sufficient contrast on white/amber panels.
- Prefer future pass: audit `text-kelly-text/55` and `/60` on large body copy for WCAG AA on tinted backgrounds.

## 10. Remaining polish recommendations

- Further shorten Gmail monitor dynamic status string in `EmailCommandCenterContent.tsx` (still env-heavy).
- Consider a single glossary drawer for staff defining “DATABASE_URL”, “preflight”, and “webhook” once.
- Public press/updates pages: TODOs are comment-only; optional move to internal doc.

## 11. Checks

Run in `H:\SOSWebsite\RedDirt`:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

(Record exact exit codes in the PR / handoff; agent run should append results below when executed.)

## 12. Next recommended slice

**Staff onboarding pass**: one printable “first 15 minutes” checklist linking Daily console → Queue → Gmail monitor → Hosted diagnostics, without repeating cockpit body copy.

---

## WorkflowIntake from `/api/forms`

Not created or altered in this polish slice. Prior Kelly SOS work and API route docs remain the source of truth for form → intake wiring.
