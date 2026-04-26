# AI migration control center — RedDirt

**Repo:** `H:\SOSWebsite\RedDirt`  
**Last updated:** Pass 02 (funnel wiring)

## RedDirt

| Field | Value |
|--------|--------|
| **Build level** | Pass 02 complete — await `npm run check` / CI |
| **Funnel status** | **Wired** — four public pathways on home; nav/footer aligned; no new routes; admin/relational untouched |
| **Notes** | Homepage `HomePathwayGateway` deprecated; `HomeEntryFunnelSection` + `navigation.ts` restructure. See `docs/REDDIRT_SITE_AND_ENGINE_FUNNEL_PLAN.md`. |
| **Sibling repos** | Do not import `sos-public`, `ajax`, `phatlip` |

## Pass history (short)

| Pass | Focus |
|------|--------|
| 01 | Route audit, engine audit, funnel planning doc |
| 02 | Entry path system: nav, home funnel blocks, footer, CTA language |

## Next suggested pass

- RD-1 / copy sweep on `(site)` user-visible strings  
- Mobile nav density check (more top-level groups)  
- Optional: relational/admin handoff **copy** on `/get-involved` only (still no engine code changes)
