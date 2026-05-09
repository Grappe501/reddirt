# Program: voter registration and tracking

**Targets:** Statewide **50,000** ambition, **per-county allocation formula**, **weekly pace bands**, **tier floors** — **[`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md` §2](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)**.  
**GOTV:** Registration **stops** at lawful deadline — see **[`LANE §6.2`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)** matrix row “Registration”.

---

## Objective

Increase **eligible voter registration** statewide and attribute **growth to county and partner effort** for KPI accountability — while keeping **hands-on training** in **non-partisan** partner lanes where legal and narrative hygiene require it.

---

## Partner model (executed)

| Role | Owner |
|------|--------|
| **Training and registration execution** | **Get Loud Arkansas** (non-partisan) — trainings, field registration support |
| **Coalition amplification** | Campaign encourages counties, schools, coalitions, county leaders to **connect with** partner-led registration |
| **Measurement and county ambition** | Campaign — voter file snapshots; **`registrationGoal`** integers per **LANE §2.2** in RedDirt |

**Public language:** Emphasize **civic participation** and **access**; avoid implying the Secretary of State candidate **administers** voter registration today.

---

## KPI framework (expanded)

1. **New registrations (file-based)** — Weekly **pace vs** **LANE §2.3** band; **Tier 1** counties flagged if **< 80%** of pro-rata YTD goal for **4 consecutive weeks**.  
2. **Partner activity** — Trainings / month (partner report); **event correlation** in RedDirt `CampaignEvent`.  
3. **County share** — After allocation + renormalization to **50,000**, **no** silent changes — changelog row in operator doc.  
4. **Multi-community overlay** — **Separate** sub-goals for **Spanish**, **Marshallese**, and **mosque-linked** events (counts only — not separate file universes in public manual).

---

## Operational workflow

1. **County lead** identifies site → schedules with Get Loud / partner.  
2. **Campaign** logs `CampaignEvent`; **tier** determines **minimum** volunteer pack (Tier 1: **two** staff/surrogates where possible).  
3. **Post-event (7 days):** file slice → **delta** vs goal; **CM brief** notes Tier 1 misses.  
4. **County workbench** — public story uses **honest labels** (planning vs verified).  
5. **Pre-deadline surge (lawful):** shift volunteer hours from **Tier 3 → Tier 1** if Tier 1 behind pace.

---

## Tier-specific standards

| Tier | Minimum partner-adjacent events / quarter (planning) |
|------|------------------------------------------------------|
| **Tier 1** | **3+** registration-adjacent touches (fair, school, faith site) |
| **Tier 2** | **1+** |
| **Tier 3** | **Opportunistic** — fulfill **floor** via roving partner days |

*Adjust seasonally — fairs-heavy Q2–Q3.*

---

## GOTV integration

| Gate | Registration program behavior |
|------|------------------------------|
| **T-56 → T-21** | Maximum lawful registration; inventory clipboards and **bilingual** forms if applicable |
| **T-21** | **Transition:** volunteer scripts pivot to **vote plan** where registration closed or redundant |
| **T-7 → E** | **Zero** registration persuasion at polls if **not** lawful; only **official** education |

---

## Multi-community emphasis

- **Muslim community** — co-hosted drives; polling-site partnerships where neutral rules satisfied.  
- **Hispanic and Marshallese** — dedicated days; translation budget line in **LANE §4.2** technology/print where tracked.

Treat population scale as **hypothesis** until validated with partners and official stats.

---

## Tool mapping (RedDirt / county workbench)

- RedDirt: **voter import**, `CountyVoterMetrics`, admin **`registrationGoal`**.  
- County workbench: registration narrative + **50K** statewide story.

---

## Gaps and mitigations

- **Attribution** — use event proximity + partner surveys; **no** overclaim.  
- **Lag** — report **4-week moving average**, not single spikes.  
- **Tier drift** — if RedDirt goals disagree with **LANE**, **LANE changelog** must record reconciliation.
