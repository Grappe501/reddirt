# Trading Lab Production Readiness

Production-ready here means a dependable educational paper-trading release. It does not mean real-money execution.

## Current estimated readiness: 74%

### Strong / substantially built
- Historical replay and fictional portfolio accounting
- Live market-data adapter and 25-symbol breadth
- Human vs shadow-autopilot decision laboratory
- Browser Market Memory and Netlify Database persistence architecture
- Outcome labels, cost-aware backtesting and rolling walk-forward research
- Progressive learning ledger and strategy lineage
- Calibration and feature-evidence engine
- Explicit no-live-orders and human-control boundaries

### Partial / release-critical
- Main dashboard integration of Learning Command Center, calibration and lineage views
- Proven production Netlify Database migrations/readback on the current deployment
- End-to-end automatic simulation closure and calibration persistence
- Input validation/rate-abuse hardening on public database-write functions
- Full CI/build proof after latest migrations
- Mobile/accessibility/browser QA
- Error/retry/offline UX and observability
- User-facing educational disclosures and methodology/help surface
- Multiplayer competition identity/session model and durable standings

### Later product phases, not required for first production educational release
- AI analyst/explanation engine
- Paper-broker adapter
- CME/futures context
- Multi-agent debate
- Desktop terminal/daily professor

## Release gates
1. All automated tests/build checks green.
2. All Netlify migrations applied successfully and durable read/write verified.
3. Main simulator contains Learning Command Center and calibration readback without breaking replay/live modes.
4. Every completed simulation produces a durable learning cycle or a visible retryable failure state.
5. Public write endpoints enforce bounded payloads and reject malformed/oversized research records.
6. No real-money order route, credentials or automatic live promotion exists.
7. Mobile and desktop smoke tests pass.
8. Educational methodology, limitations and simulated-performance disclosures are visible.
9. Production telemetry surfaces provider/database failures without exposing secrets.
10. A release candidate passes a full replay simulation and a live-data shadow session.
