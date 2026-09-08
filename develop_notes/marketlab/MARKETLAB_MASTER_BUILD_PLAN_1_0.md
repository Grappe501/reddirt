# MarketLab — Master Build Plan 1.0

**Status:** Canonical architecture / pre-code  
**Repository:** Grappe501/reddirt  
**Deployment target:** Independent Netlify application  
**Database target:** RedDirt Postgres infrastructure with an isolated MarketLab domain  
**Real-money execution:** Prohibited. MarketLab is a simulation and teaching platform.

## Product North Star

MarketLab is an AI-native stock-market simulation, competition, and education platform. It should not merely answer “How much money did I make?” It should help players understand what they did, why it worked or failed, how much risk they took, whether the result reflected skill or luck, what alternatives existed, and whether their decision-making is improving.

Core doctrine: **MarketLab does not teach people which stock to buy. It teaches people how to make, measure, and improve financial decisions.**

The central product question is: **Did you make a good decision, or did you just make money?**

## Product Boundary

MarketLab lives in the RedDirt repository and may share approved database infrastructure, but it is a standalone product. It must have its own application boundary, authentication surface, environment/configuration boundary, Netlify site, deployment pipeline, URL/domain, UI/navigation, and product identity. It must not become an SOSWebsite route, campaign-admin module, or public SOSWebsite dependency.

Before application scaffolding, Build 1 must audit the live repository and choose the least disruptive physical directory and Prisma/database ownership pattern. The conceptual target is an independent application such as `apps/marketlab/`, an optional reusable engine package such as `packages/marketlab-engine/`, and canonical project documentation under `develop_notes/marketlab/`. Exact paths are subject to repository audit.

## Three-Engine Architecture

### 1. Market Engine
Owns securities, current/historical market data, market sessions, calendars, corporate actions, quotes/bars, and execution-price inputs. It knows nothing about competition membership or player identity.

Use a replaceable `MarketDataProvider` abstraction with capabilities such as security search, quote retrieval, batch quotes, historical bars, market status, and streaming/subscription where supported. Market-data vendors must remain replaceable. Commercial redistribution/licensing review is an explicit launch gate.

### 2. Game / Simulation Engine
Owns competition rules, portfolios, orders, simulated executions, transaction friction, cash/position accounting, standings, achievements, seasons, and game progression.

Canonical trade path:

`player -> order request -> rule validation -> market status -> quote -> simulated execution -> fees/friction -> immutable ledgers -> positions -> portfolio -> analytics`

Balances are results; ledgers are truth. Cash, positions, executions, orders, and fees must be reconstructable and auditable.

### 3. Intelligence Engine
Owns quantitative strategy ghosts, Shadow AI, hindsight optimization, counterfactual analysis, risk analytics, player behavior metrics, weekly intelligence, Market IQ, and retrospective coaching.

Decision-time AI and review-time AI must be separated. Hidden Shadow AI recommendations are not exposed to players during active competition unless a future competition mode explicitly permits coaching.

## Simulation Realism

Competition rules must be configurable. Initial modes should support starting capital, duration, tradable universe, fractional-share policy, commission model, market-hours policy, and permitted order types. Later realism may include bid/ask spread, slippage, partial fills, liquidity constraints, trading halts, dividends, splits, symbol changes, mergers, delistings, stops, stop-limits, short selling, and margin.

Commission/friction profiles should eventually include modern zero-commission retail, classic fixed commission, historical commission environments, percentage/custom formulas, spread, slippage, and applicable simulated regulatory sell-side fees.

## Competition System

The original flagship template is the Six-Week Classic: players begin with $1,000 and compete using real/current market pricing without real trades.

The engine must not hard-code six weeks. Future templates include One-Day Trader, Thirty-Day Challenge, Semester Investor, Long-Term Investor, Beat the Benchmark, Risk Manager, Market Crash Survival, AI vs Human, Team Challenge, Corporate Training, and Historical Replay.

Long-term hierarchy should support Platform -> Organization -> Program -> Competition -> Team -> Player so schools, universities, companies, nonprofits, clubs, and public tournaments can use the same engine.

## Player Experience

The dashboard should feel like a premium financial application rather than an LMS. Core surfaces include portfolio value, cash, buying power, invested value, daily and total P/L, realized/unrealized P/L, performance chart, positions, watchlist, recent activity, competition standings, Market IQ, and league rank.

Trading flow: security search -> security detail/chart -> buy/sell ticket -> quantity/dollar amount -> order type -> estimated price/friction/total -> review -> PLACE SIMULATED ORDER.

Mobile-first navigation is a core requirement. A working conceptual primary nav is Home / Markets / Trade / League / Me.

## AI System

### Shadow Trader
An invisible contemporaneous agent receives only information available at the decision timestamp: portfolio state, competition rules, market snapshot, permitted historical context, and other approved contemporaneous information. Its recommendation is timestamped and frozen. Future information must never contaminate a historical Shadow decision.

Store structured evidence: timestamp, market snapshot reference, portfolio snapshot, information set, model identifier, prompt/strategy version, recommendation, concise rationale, confidence, and run metadata. Do not store or expose hidden chain-of-thought.

### Hindsight Oracle
A separate retrospective optimization system may use future realized prices. Its purpose is to estimate an achievable opportunity ceiling under the same capital and game rules. It must always be labeled as hindsight and never represented as a decision a player could necessarily have known to make.

### Strategy Ghosts
Initial experimental controls should include Cash, broad-market benchmark, equal-weight diversified, buy-and-hold, momentum, mean reversion, low-volatility, random trader, Shadow AI, and Hindsight Oracle. Deterministic strategies should not require LLM calls.

### Trade Analyst
After an appropriate reveal/delay period, evaluates trade outcomes and dimensions such as entry quality, position sizing, cost efficiency, risk contribution, and exit quality, with plain-language educational explanation.

### Player Twin
A longitudinal behavioral model tracks non-sensitive trading behaviors such as turnover, holding duration, concentration, drawdown behavior, entry/exit timing, winner/loser duration, sector preference, momentum chasing, dip buying, post-loss behavior, and cost leakage. It is used for retrospective education, not real-world financial profiling or brokerage execution.

### Counterfactual Engine
For important decisions, calculate feasible alternatives such as actual action, hold/do-nothing, delayed entry, different position size, alternative exit horizon, benchmark allocation, and Shadow AI action. Public terminology should favor “Opportunity Delta” rather than regret framing.

## AI Cost Architecture

Do not call an LLM continuously for every quote or player. Quantitative strategies run deterministically. LLM intelligence should be event-driven: player trade, meaningful portfolio/market event, scheduled checkpoint, market open/close, competition milestone, and weekly review. OpenAI credentials remain server-side.

## Market IQ

Market IQ begins as a transparent game/learning score, not a scientifically validated measure of investing intelligence. Initial 1000-point conceptual weighting:

- Return Quality: 250
- Risk Management: 200
- Decision Quality: 150
- Opportunity Capture: 150
- Cost Efficiency: 100
- Consistency: 100
- Learning Growth: 50

The formula must be versioned and later validated/refined using actual player data. Opportunity Capture requires a dedicated mathematical specification before production scoring, especially for negative-return periods and unusual opportunity ranges.

## Two Leaderboards

1. **Wealth Leaderboard:** who has the highest portfolio value/return under competition rules.
2. **Investor / Market IQ Leaderboard:** who demonstrates stronger risk-adjusted, cost-aware, repeatable decision quality.

A concentrated lucky bet may win Wealth while ranking poorly on Market IQ. MarketLab should teach that distinction rather than altering the player's legitimate simulated return.

## Risk Analytics

Core analytics should grow to include volatility, maximum drawdown, single-name concentration, sector concentration, turnover, cash exposure, risk-adjusted return, benchmark sensitivity/beta, and downside capture. Advanced statistics may expose Sharpe/Sortino-style measures; beginner mode translates them into plain language.

## Weekly Intelligence Report

At each competition week boundary, generate a report containing starting/ending value, return, benchmark return, Wealth rank, Market IQ rank, Shadow AI comparison, hindsight opportunity ceiling, strongest decision, largest performance drag, trading friction, turnover, maximum drawdown, strategy-ghost comparisons, and a concise educational AI analysis.

A flagship visualization should plot the player's actual portfolio against benchmark, Shadow AI, selected strategy ghosts, and hindsight opportunity over time. “Replay My Week” should present a chronological decision/market timeline.

## Trade Thesis

Players may optionally record why they are entering a position (valuation, earnings, momentum, news, technical setup, long-term investment, dividend, sector trend, intuition, other) and an optional written thesis. Retrospective analysis can evaluate thesis quality separately from financial outcome. A good decision can lose money; a bad decision can make money.

## Historical Market Replay

Future Market Replay uses the same simulation engine against historical data with a virtual clock. Players receive only information that would have been available at that historical moment. Candidate scenarios include Black Monday, dot-com crash, 2008 financial crisis, COVID crash, meme-stock era, and inflation/rate shocks.

## Game Layer

Engagement mechanics should reward learning and discipline rather than raw trading frequency. Future mechanics include XP, levels, achievements, missions, weekly challenges, leagues, seasons, team competitions, trophies, social activity, and public spectator standings. Example achievements: First Trade, Diversified, Beat the Benchmark, Risk Manager, Patient Investor, Thesis Builder, Cost Cutter, Comeback, Consistency, Shadow Beater.

## Trainer / Enterprise Layer

Trainer dashboards should surface cohort-level learning: median return, benchmark, Market IQ distribution, average turnover, average positions, concentration, transaction friction, common mistakes, most improved, strongest risk-adjusted result, and AI-generated instructor briefing. Long-term enterprise support includes branded competitions, organizational administration, corporate training, universities, schools, financial-literacy programs, and public tournaments.

## Logical Data Domains

Identity: organizations, players, profiles.  
Game: competitions, memberships, teams, rules.  
Market: securities, quotes, bars, market sessions, corporate actions.  
Trading: portfolios, orders, executions, positions, cash ledger, fees.  
Analytics: portfolio snapshots, performance metrics, risk metrics.  
AI: shadow decisions, shadow portfolios, oracle runs, counterfactuals, trade evaluations, player behavior metrics.  
Gameplay: achievements, player achievements, missions, seasons.  
Education: trade theses, lessons, weekly reports.  
Audit: audit events, engine runs.

Exact physical schema and naming are locked only after Build 1 repository/database audit.

## Security and Product Guardrails

- No real brokerage execution in the initial product architecture.
- No real-money trading pathway hidden behind the simulator.
- Server-side secrets only.
- MarketLab must remain isolated from SOSWebsite UI/routes/deployment.
- AI Shadow decisions remain hidden during competition unless rules explicitly enable coaching.
- Structured AI rationale only; do not persist hidden chain-of-thought.
- Immutable financial/audit ledgers.
- Explicit market-data licensing/redistribution gate before broad commercial launch.
- Version simulation rules, scoring formulas, prompts, strategies, and AI models so historical reports remain reproducible.

## Admin Command Center

Admin-only intelligence should eventually show live players, competitions, simulated orders/volume, market-data status/latency, AI status/cost, failed orders, ledger health, Shadow runs, Oracle runs, and drilldowns comparing Actual Portfolio / Shadow / Benchmark / Ghost Strategies / Oracle with decision timeline, risk metrics, behavior signals, trade attribution, and AI analysis.

## Six Major Builds

### Build 1 — Foundation / Playable
Standalone app boundary; repository/database audit; authentication; competition model; $1,000 starting portfolio; security search; current quote integration; simulated buy/sell; configurable commission/friction; immutable accounting; portfolio; transactions; basic leaderboard; independent Netlify deployment.

### Build 2 — Realism / Believable
Market sessions, stronger order engine, spread/slippage, historical charts, watchlists, performance calculations, risk calculations, improved leaderboards, competition administration.

### Build 3 — Game / Addictive
Invites, public/private leagues, teams, achievements, XP, missions, seasons, mobile polish, trainer dashboards, social competition activity.

### Build 4 — Intelligence
Shadow AI, strategy ghosts, benchmarks, counterfactuals, Hindsight Oracle, Market IQ, Player Twin, attribution, weekly intelligence reports.

### Build 5 — Market Laboratory
Historical replay, scenario competitions, trade theses, AI postmortems, curriculum/lessons, research notebooks, corporate/instructor modes.

### Build 6 — Platform / Scale
Organization hierarchy, branded leagues, national tournaments, spectator mode, advanced analytics, enterprise administration, commercial hardening, scale/performance, integration/API layer.

## Build 1 Acceptance Gate

Build 1 is complete only when an independent MarketLab deployment can:

1. Sign in.
2. Create or join a competition.
3. Receive exactly $1,000 simulated starting cash under the default template.
4. Search a real security.
5. Retrieve a current market price.
6. Submit a simulated buy.
7. Calculate configured transaction friction.
8. Create immutable accounting records.
9. Show the resulting position.
10. Show the correct cash change.
11. Revalue the portfolio.
12. Submit a simulated sell.
13. Calculate realized gain/loss.
14. Display transaction history.
15. Display competition ranking.
16. Prove no real brokerage execution exists.
17. Prove MarketLab is isolated from SOSWebsite.
18. Pass typecheck/build/database/domain-specific gates.
19. Commit/push the complete pass to GitHub.
20. Produce an independent Netlify deployment.

## Build Workflow Rule

Every substantive MarketLab pass performed through this ChatGPT project should end with its durable artifacts/code committed to the `Grappe501/reddirt` GitHub repository before the pass is reported complete, unless a genuine safety, permission, repository-conflict, or destructive-boundary issue prevents the write. If a pass cannot be pushed, that failure must be stated explicitly rather than treating the pass as complete.

## Next Pass

`MARKETLAB-BUILD-1-FOUNDATION-1.0`

First action: audit the live repository structure, Prisma/database ownership, Netlify configuration, authentication patterns, environment conventions, and existing multi-app boundaries. Then lock the physical MarketLab architecture and scaffold the smallest complete independent vertical slice without modifying SOSWebsite behavior.
