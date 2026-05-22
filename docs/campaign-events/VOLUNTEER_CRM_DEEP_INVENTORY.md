# Volunteer / CRM Deep Inventory

**Scope:** `H:\SOSWebsite` · **Unification:** `RedDirt/` Campaign OS  
**Date:** Volunteer OS sprint

## Summary

| Lane | CRM / volunteer capability | Unify? |
|------|---------------------------|--------|
| **RedDirt** | Prisma REL-2, forms, intake OCR, asks, V1 JSON OS | **Yes** |
| countyWorkbench | KPI shells, mailto drafts | Bridge only |
| sos-public | Signup URL redirect | Point to RedDirt forms |
| ajax | Supabase reach queue | **No** (firewall) |
| phatlip | Content only | **No** |

## RedDirt — authoritative (functional)

| Path | Purpose | Fields | Status |
|------|---------|--------|--------|
| `prisma/schema.prisma` | `VolunteerProfile`, `RelationalContact`, `WorkflowIntake`, `VolunteerAsk`, signup sheets | Full CRM graph | Functional (DB) |
| `src/app/api/forms` + `handlers.ts` | Public volunteer/host intake | name, email, county, roles, interests | Functional |
| `src/components/forms/VolunteerForm.tsx` | Signup UI | preferredRole, power_of_five, phone bank interest | Functional |
| `src/app/admin/(board)/relational-contacts` | REL-2 admin CRM | owner, powerOfFiveSlot, organizingStatus | Functional |
| `src/app/admin/(board)/volunteers/intake` | OCR signup sheets | sheet entries, voter match | Functional |
| `src/app/admin/(board)/asks` | Canvass/phone bank asks | shift metadata | Functional |
| `src/lib/volunteer-ops/provision-solo-team.ts` | Auto team on signup | team slug | Functional |
| `data/campaign-events/volunteers/*.json` | **V1 Volunteer OS** (this sprint) | VolunteerProfile V1 | Partial |
| `src/app/admin/(board)/volunteers` | Command center | — | V1 functional |

## RedDirt — partial / scaffold

| Path | Gap |
|------|-----|
| `workbench/people/relational-organizing` | Preview only — no save |
| `text-reach` | SMS locked |
| `organizing-intelligence` admin | Placeholder |
| `docs/volunteer-*.md` | Gamification design ≠ GAME-2 code |
| Phone/text bank execution | Manual doctrine only |

## Other lanes

- **countyWorkbench:** `volunteerGoal` in dashboard V2 CSV; Pope sample page; no CRM DB.
- **sos-public:** `NEXT_PUBLIC_VOLUNTEER_SIGNUP_URL` redirect.
- **ajax:** `reach_out_list_items`, `outreach_queue` — separate product.

## Risks

- Dual volunteer entry (RedDirt vs sos-public)
- Demo metrics on public OIS
- PII in signup-sheet media
- TCPA/consent not fully productized for SMS
- V1 JSON vs Prisma duplication — **Prisma wins** when DB up

See `VOLUNTEER_SYSTEM_GAP_ANALYSIS.md` for priorities.
