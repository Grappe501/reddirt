# V6-01 — Production Experience Inventory & Wiring Map

Status: CANONICAL V6 ENTRY MAP

## Purpose
V1–V5 built a deep simulator, research organization, adaptive learning organization, and competition architecture. V6 converts that capability into one coherent production product. This inventory is the bridge between backend capability and the experience a member actually sees.

## Current production shell
- Build: Vite 7, static SPA, Netlify publish from dist.
- Entry: index.html currently loads phase3-main.js plus durable-bootstrap.js and production-bootstrap.js.
- Production functions already exist for market snapshot/health/history, market memory, learning, calibration, research validation, and production database proof.
- Current visible shell is legacy phase-oriented UI. It is not yet the canonical Wealth Builder product shell.
- src/main.js still contains the old Phase 1 $500 synthetic replay control room. It is useful historical code, not the V6 experience target.
- V5 competition modules exist as tested runtime modules but are not yet wired into production routes/screens or durable production persistence.

## Canonical V6 product journey
WELCOME / INVITATION
→ DASHBOARD
→ INTELLIGENCE TAPE
→ PORTFOLIO
→ RESEARCH FLOOR
→ SYMBOL / COMPANY RESEARCH
→ SIMULATION LAB
→ UNIVERSITY
→ COMPETITION LOBBY
→ LIVE LEAGUE
→ HUMAN-vs-AI LAB
→ 90-DAY INVESTOR REPORT
→ ALUMNI CONTINUITY

The persistent product navigation target is:
WEALTH BUILDER | Portfolio | Research | Markets | Lab | University | Competition

## Experience constitution
The first screen must answer: How am I doing? What happened? What needs my attention? What is Wealth Builder investigating? What should I learn next?

Do not greet a member with a chart wall or an agent wall. Default depth is calm and plain-language. Capability unfolds through GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY. Every score must explain its semantics. Evidence Score is not probability of profit. Human decision remains final. No real-money execution.

## Surface inventory

| Surface | Existing capability | Current state | V6 wiring target |
|---|---|---|---|
| Product shell / navigation | phase3 UI + multiple CSS/UI modules | PARTIAL / LEGACY | Replace phase framing with canonical Wealth Builder shell and responsive navigation |
| Dashboard | learning command center, production integration, market brain, risk, V4 org command center | PARTIAL / FRAGMENTED | One calm dashboard with portfolio, attention, WB research, learning, league status |
| Intelligence Tape | V5 constitution requirement | BACKEND CONTRACT ONLY | Persistent authenticated footer; evidence-traceable clickable research output |
| Portfolio | portfolio.js + V5 competition portfolio | PARTIAL | Unified simulated portfolio view using canonical V5 accounting for competition |
| Markets | live-market, breadth-live, market analytics/memory | STRONG ENGINE / PARTIAL UI | Production market overview with health/degraded states and depth doors |
| Research Floor | V3 research command center + V5 research-floor | STRONG ENGINE / NOT PRODUCT-WIRED | Calm research organization view; no 46-agent default grid |
| Symbol research | symbol-intelligence, fundamentals, evidence graph, source adapters | STRONG ENGINE / PARTIAL UI | Company page with Explain/Evidence/Bull-Bear/Simulate/Learn |
| Lab / simulation | replay, strategy lab, calibration, outcome lab, forward shadow | STRONG ENGINE / FRAGMENTED | Unified laboratory surface; point-in-time and cost-aware |
| University | education ecosystem, knowledge depth, university integration | PARTIAL UI | Contextual learning linked from every concept and research finding |
| Coach | ai-copilot-professor | PARTIAL / PROVIDER DEPENDENT | Context-aware assistant tied to current page and evidence |
| Competition lobby | V5 cohort lobby/lifecycle | BACKEND CONTRACT ONLY | 10-seat lobby, verification state, next start, sealed AI contestant |
| Live league | V5 live league/open portfolio/analytics | BACKEND CONTRACT ONLY | Day X/90, rank, portfolio, AI position, attention; completed trades visible |
| Human-vs-AI Lab | V5 human-ai laboratory | BACKEND CONTRACT ONLY | Frozen belief/evidence/decision/outcome comparison |
| Investor Report | V5 investor report | BACKEND CONTRACT ONLY | End-of-cohort report surface and export-ready representation |
| Alumni | V5 alumni conversion | BACKEND CONTRACT ONLY | Preserve history and free alumni continuity; optional paid plan |
| Admin | V5 admin command center | BACKEND CONTRACT ONLY | Operator-only exception-first command center |

## Production API / persistence inventory
Existing Netlify functions: calibration-cycle, calibration-history, learning-cycle, learning-history, market-health, market-history, market-memory-analogues, market-memory-ingest, market-memory-outcomes, market-memory-status, market-snapshot, production-db-proof, production-write-proof, provider, research-validation.

V6 must add production adapters/persistence for V5 identity, invitation/vouch graph, integrity cases, cohorts, competition portfolios/fills, AI seals, open portfolio ledger, research credits/referrals, frozen human-vs-AI decisions, investor reports, alumni state, and admin audit records. Do not bypass the existing Netlify Database boundary.

## Wiring classification
- PRODUCT-WIRED: visible production surface backed by production path.
- PARTIAL: useful UI or engine exists but does not yet satisfy the canonical experience.
- ENGINE-READY: tested domain capability exists but needs API/persistence/UI wiring.
- MOCK/SYNTHETIC: visible data is demonstration/synthetic and must remain labeled.
- PROVIDER-DEPENDENT: production behavior requires configured external provider.
- MISSING: no adequate production implementation yet.

## V6 execution order
1. V6-02 Product Shell + Experience Router — canonical navigation, responsive shell, Dashboard first frame, Intelligence Tape frame, route/state architecture.
2. V6-03 Production Data Facade — one browser-safe client contract over existing Netlify market/learning/research functions with explicit degraded states.
3. V6-04 Dashboard Wiring — portfolio + market + research + learning + competition summary.
4. V6-05 Intelligence Tape — persistent evidence-traceable research output channel.
5. V6-06 Research Floor + Symbol Research — V3/V5 engines into calm product UI.
6. V6-07 Portfolio + Simulation Lab — canonical competition accounting and simulation workflows.
7. V6-08 University + Contextual Coach — knowledge depth everywhere.
8. V6-09 Competition Persistence/API — durable identity, invites, cohorts, fills, seals, credits and audit records.
9. V6-10 Competition Lobby + Onboarding — invitation through verified cohort seat.
10. V6-11 Live League — league cockpit/open portfolio/AI comparison.
11. V6-12 Human-vs-AI Lab — frozen reasoning comparison and outcome attachment.
12. V6-13 Investor Report + Alumni — Day 90 continuity.
13. V6-14 Admin Operations — operator exception cockpit.
14. V6-15 Responsive/Accessibility/Performance hostile UX audit.
15. V6-16 Production End-to-End Proof — invitation → 90-day lifecycle simulation → alumni, with launch blockers explicit.

## Immediate finding
The project has substantially more engine capability than production experience wiring. The highest-value next move is therefore not another intelligence subsystem. It is V6-02: establish the canonical Wealth Builder shell and route/state architecture, then progressively connect existing engines behind it.

## V6 invariants
V5 architecture remains locked. V6 may adapt presentation and add production adapters but must not silently weaken competition fairness, point-in-time evidence, sealed AI, human review, privacy boundaries, evidence semantics, research-cost controls, or simulation-only execution. Existing phase/demo code may remain during migration, but canonical production entry must stop presenting the product as a Phase 1/2/3 prototype.
