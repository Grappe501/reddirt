# Web manual — route plan (not implemented; Pass 2B)

**Base:** `/manual` (public) and `/manual/staff` or subdomain (staff) — **owner** decides one URL plan.

| Route | Source | Build |
|-------|--------|--------|
| `/manual` | `README.md` | Public index |
| `/manual/parts/i–xx` or `/manual/ch/00-…`…`/23-…` | `chapters/*` | **Book** order |
| `/manual/role` | `ROLE_MANUAL_INDEX` | **Start by role** |
| `/manual/role/[slug]` | `roles/<slug>/README.md` | 26 slugs |
| `/manual/workflow` | `WORKFLOW_INDEX` | **Start by workflow** |
| `/manual/workflow/[slug]` | `workflows/*.md` | kebab from filename |
| `/manual/phase/[n]` | `DAY_ONE_TO_ELECTION_DAY...` | **Start by phase** 0–17 |
| `/manual/lifecycle` | same file | **Lifecycle** overview |
| `/manual/cross-wiring` | `SYSTEM_CROSS_WIRING_REPORT.md` | **Staff** or split public summary |
| `/manual/requests` | `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | **Staff/owner** |
| `/manual/maps/*` | `maps/*` + `SYSTEM_MAP_INDEX` | Mermaid **SVG** or client render |

**In-app (future) — not in Pass 2:**

- `?manual=county-leader` on authed `counties` or `dashboard` — opens **side panel** (see IA doc).  
- `GET /api/manual/summary?slug=…` only if public-safe — **no** Prisma PII; **static** or **RAG** on **redacted** manual only.

**Do not** mirror `api/author-studio` or voter routes in the **public** manual **sitemap**.

**Last updated:** 2026-04-27 (Pass 2B)
