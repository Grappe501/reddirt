# AI Agent Tool Package — master inventory

**Route:** `/admin/campaign-events/ai-tools`  
**Source:** `src/lib/campaign-events/ai-tools-master-catalog.ts`  
**UI:** `src/components/admin/campaign-events/CampaignEventAiToolsPage.tsx`

## Purpose

Single roadmap page for all current and future AI/deterministic tools across campaign calendar + travel ledger. Unless status is **functional** or **partial**, entries are inventory only — no runtime wiring from this page.

## Lifecycle groups (22)

1. Calendar Intake  
2. Tentative Event Approval  
3. Conflict Detection  
4. Event Fact Card Completion  
5. Travel Ledger  
6. Mileage/Reimbursement  
7. County/Region Intelligence  
8. Host Dashboard  
9. Invitation List  
10. Volunteer Operations  
11. Candidate Briefing  
12. Campaign Manager Briefing  
13. Run of Show  
14. Materials/Pack List  
15. Event Cost/Budget  
16. Compliance/Receipts  
17. Communications/Email  
18. Text/Phone/Postcard Future Tools  
19. Hot Wash/Learning  
20. Automation Sequences  
21. Reporting/Exports  
22. SaaS/Client Campaign Dashboard  

## Per-tool fields

| Field | Description |
|-------|-------------|
| name | Tool label |
| purpose | What it does |
| status | `idea` · `scaffolded` · `partial` · `functional` |
| priority | P0–P3 |
| trigger | When it runs |
| reads / writes | Data surfaces (expandable row in UI) |
| human approval required? | Yes/No filter |
| guardrails | Risk notes |
| future route | Target URL or module |

## Filters

- Lifecycle  
- Status  
- Priority  
- Human approval required (checkbox)  
- Search (name, purpose, route)

## Master build docs (Sprint 0)

| Doc | Role |
|-----|------|
| [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) | 10-sprint plan, routes, data tiers |
| [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md) | Live sprint status |
| [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md) | Sprint → catalog tool ids |
| [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md) | Dependencies and blockers |

Banner on `/admin/campaign-events/ai-tools` lists these paths.

## Related routes

| Route | Role |
|-------|------|
| `/admin/campaign-events/workbench` | Batch review |
| `/admin/campaign-events/review?month=YYYY-MM` | Month review wizard |
| `/admin/campaign-events/travel-report?month=YYYY-MM` | Monthly travel ledger report |
| `/admin/campaign-calendar/timeline` | Calendar OS views |

## Maintenance

Add or edit tools in `ai-tools-master-catalog.ts` only. Do not duplicate catalogs in `ai-tools-catalog.ts` (deprecated shim exports `CAMPAIGN_EVENT_AI_TOOL_CATEGORIES`).
