# Stubs, dead ends, and directional replacements — Pass 2A

**Method:** `schema` review, `DASHBOARD_HIERARCHY_COMPLETION_AUDIT`, `docs/admin-orchestrator.md` deferred list, `src/app` placeholder pages, `open-work` comments (read-only unifier; “no master table”).

| Item | File / route | Status | Original / likely purpose | Keep / merge / document | Risk if “fixed” by deletion | Pass 2A recommendation |
|------|-------------|--------|-----------------------------|------------------------|-----------------------------|------------------------|
| Personal dashboard | `src/app/(site)/dashboard/page.tsx` | **Placeholder** | Future member home | **Keep**; gate language in manual | Breaks marketing links to `/dashboard` | **Document** until auth; no public “done” |
| Leader dashboard | `.../dashboard/leader/page.tsx` | **Placeholder** | P5/team | **Keep** | Same | Same |
| Admin OIS | `admin/(board)/organizing-intelligence` | **Stub** | Operator mirror of OIS | **Keep** as **hub**; link-out | Losing wayfinding | Expand **copy** or merge into workbench only if IA improves |
| OIS county | `organizing-intelligence/counties/[countySlug]/page.tsx` | **Stub** | Unify w/ county v2 | **Document**; future hydrate | Premature 404 if removed | **Do not** delete until v2 path decided |
| Region `[slug]` | `organizing-intelligence/regions/[slug]/page.tsx` | **Partial** | Catch-all for 8 + future | **Keep** | 404s | Align slugs w/ `arkansas-campaign-regions` |
| Orchestrator **insights** | `admin/.../insights` (per admin-orchestrator.md) | **Placeholder** | Metrics | **Keep** as stub | **Low** if removed, but may break nav | **Document** |
| **Outbound** social publish | docs say deferred | **Not built** | NDE/social | **N/A** | N/A | **Do not** promise in public manual |
| **P5** full DB | Plan vs `VolunteerProfile` + field + narrative panels | **Partial** | Relational program | **Merge** in future **packet** | Data loss if columns dropped wrong | **Additive** migrations only (policy) |
| `metadata.ai` on intake | `handlers.ts` | **Real field** in JSON | Triage help | **Rename in UI** later to **internal** “classification” not “AI” for staff | N/A | **Do not** show raw JSON to volunteers |
| Author studio | `api/author-studio/*` | **Live routes** | Staff drafting | **Document** as **internal** | Blocks staff if removed casually | **Separate** from **Campaign Companion** in manual |
| GPT classify | `classifyIntake` | **Optional** | Triage | **Feature-flag** by env | None | Disclose in ops runbook, not public **Guided** copy |
| Open-work | `open-work.ts` | **Read model** (no master) | **UWR-1/2** | **Keep** — core | Regression in workbench if replaced wrong | **Cross-wire** in `SYSTEM_CROSS_WIRING_REPORT` |
| GOTV | `admin/(board)/gotv/page.tsx` | **TBD depth** | GOTV | **Verify** in Pass 3 | N/A | **Re-audit** before “command” language |

**Conclusion:** Most “stubs” are **intentional** placeholders for **gated** or **future** product. **Do not** bulk-delete. Prefer **readiness** labels and **Steve** sign-off before removing routes that appear in `navigation` or email templates.

**Last updated:** 2026-04-27 (Pass 2A)
