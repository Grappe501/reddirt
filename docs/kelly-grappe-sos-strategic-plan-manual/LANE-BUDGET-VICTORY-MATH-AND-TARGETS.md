# LANE — Budget, victory math, registration, and county targets

**Purpose:** Single **numbers lane** for the strategic plan manual. All **other parts** reference this file for **targets, tiers, budget mix, and GOTV resourcing**. Replace figures after each **voter file refresh**, **finance close**, or **path-to-victory** recalc.

**Owner:** Campaign Manager + Finance + Data lead (triad signs off monthly).  
**Classification:** Internal — **redact** dollar amounts and county lists before sharing externally.

**Last updated:** 2026-05-08 · Manual v1.1

---

## 0. How to use this lane (discipline)

1. **Hypothesis vs locked:** Labels in tables below are **planning hypotheses** until leadership marks them **LOCKED** in finance or data systems.  
2. **No false precision:** Round public registration stories to **thousands** unless using a cited official table.  
3. **GOTV integration:** Section 6 is the **master backward clock**; every program part of the manual should align **tasks and spend** to these gates.

---

## 1. Victory math (statewide)

### 1.1 Vote goal scenario table (replace cells from data team)

Use **official turnout history** for Secretary of State or comparable statewide down-ticket races as baseline. The table below is a **worksheet** — not a prediction.

| Scenario | Implied SOS turnout (votes cast) | Votes needed to win (~50% + 1) | Illustrative **net margin** cushion (planning) |
|----------|----------------------------------|--------------------------------|-----------------------------------------------|
| **Low** | 650,000 | 325,001 | +15,000 to +25,000 |
| **Mid** | 900,000 | 450,001 | +25,000 to +40,000 |
| **High** | 1,100,000 | 550,001 | +35,000 to +55,000 |

**Planning margin target (general election, hypothesis):** build programs capable of producing **≥ 35,000 net votes** of value across Persuasion + Turnout + Registration (attrib.) combined — **Data lead replaces** with modeled gap after first wave of polling/file integration.

**Primary election (if applicable):** set **vote share** and **floor** targets from **field counts** and polling; placeholder: **finish first** with vote margin **≥ 5–8 points** over nearest rival in a two-way, or top-two in crowded field — **replace before primary filing**.

### 1.2 Allocator: where net votes must come from

| County tier | Share of **planning margin** goal | Role |
|-------------|-----------------------------------|------|
| **Tier 1 — Core PTV** | **62%** (range 58–68%) | Registration velocity, persuasion IDs, GOTV depth |
| **Tier 2 — Expansion** | **26%** (range 22–30%) | Fairs, LTE, one strong anchor per county |
| **Tier 3 — Long tail** | **12%** (range 10–15%) | Visibility, digital geofence, 1× annual touch |

*If one region underperforms, shift **5 points** of burden to Tier 1 counties with surplus volunteer capacity — **monthly CM decision**.*

### 1.3 Down-ballot “SOS-specific” behavior

SOS sees **drop-off** from top-of-ticket. Planning assumes **retention rate** vs gubernatorial or senate (if same cycle): **92%–97%** where same party — Data verifies from past JSON ingest in RedDirt / public results. **Volunteer scripts** must mention SOS by name in **final 21 days**.

---

## 2. Registration targets

### 2.1 Statewide anchor

| Metric | Target | Notes |
|--------|--------|--------|
| **STATEWIDE_NEW_REG_GOAL (cycle)** | **50,000** | Aligns `countyWorkbench` **50K registration ambition** narrative; **not** a legal obligation |
| **By primary milestone** | **12,000–18,000** new (hypothesis) | Partner-heavy months Jan–Apr prior to primary |
| **Primary → general bridge** | **remainder to 50K** | Youth + fair season acceleration |

*Adjust primary split if calendar moves.*

### 2.2 County allocation (method)

1. Pull **active registrants** per county from latest **licensed file snapshot** (state denominator).  
2. **Proportional share:**  
   `raw_goal = STATEWIDE_GOAL × (county_active_regs / state_active_regs)`  
3. Apply **tier multiplier** then **renormalize** to sum exactly **50,000**:  
   - Tier 1 × **1.12**  
   - Tier 2 × **1.00**  
   - Tier 3 × **0.88**  
4. Apply **floor** so no county below:  
   - Tier 1 floor: **600**  
   - Tier 2 floor: **280**  
   - Tier 3 floor: **80**  
5. Write final integer goals into RedDirt **`CountyCampaignStats.registrationGoal`** and verify mirror to `CountyVoterMetrics` after recompute (see `PROJECT_MASTER_MAP` source-of-truth notes).

### 2.3 Weekly operational pace (statewide)

| Phase | New regs / week (statewide, planning) |
|-------|----------------------------------------|
| **Ramp** | 350–600 |
| **Peak (fair + schools)** | 900–1,400 |
| **Final 8 weeks before reg deadline** | 1,200–2,000 |

*Legally respect **blackout** and **partner** training capacity — do not treat table as cap.*

---

## 3. County tiers and target county list (PTV scaffolding)

**Rule:** This is the **default scaffolding**; **CM + data** may **promote/demote** counties monthly. **Pope** remains **narrative reference** (`countyWorkbench` full profile standard).

### 3.1 Tier 1 — Core path-to-victory (high touch)

**Minimum program standard:** **3+** candidate or senior surrogate visits per cycle (or equivalent video town halls), **2+** small gatherings, **fair OR major festival**, **LTE wave**, **GOTV captain**, **radio weeks** in general window.

| Region (campaign group) | Counties (default scaffold) |
|-------------------------|----------------------------|
| **Central** | Pulaski, Faulkner, Saline, Lonoke, **Pope** |
| **NWA** | Benton, Washington |
| **River Valley** | Sebastian, Crawford |
| **Northeast** | Craighead, Greene, Mississippi |
| **Delta / East** | Crittenden, Jefferson, St. Francis |
| **South / SW** | Union, Miller, Ouachita, Columbia |
| **Optional promote-ins** | Garland, White, Baxter, Sebastian-adjacent micro-targets per data |

*Count: **~18–22** counties in Tier 1 default — trim to **15** if capacity-constrained; **do not** trim Pulaski, Benton, Washington, Sebastian, Crittenden without written reason.*

### 3.2 Tier 2 — Expansion

All remaining counties with **population ≥ ~35,000** registered *or* **coalition anchor** (Hispanic, Marshallese, municipal anchor, college county) per intelligence intake — **maintain list in county workbench operator export**.

**Minimum program:** **1** gathering OR **1** fair booth OR **2** LTE waves + **digital geofence** + **volunteer lead** assigned.

### 3.3 Tier 3 — Long tail

Remaining counties.

**Minimum program:** **digital**, **1** county party meeting, **merch** available on request, **tip line** monitored, **GOTV** sign bundle if volunteer exists.

---

## 4. Budget lane (category mix and envelopes)

### 4.1 Phased spending envelopes (planning)

| Phase | Indicative **annualized** run rate | Notes |
|-------|-------------------------------------|--------|
| **Bootstrap** | **$180k – $400k** | Travel-heavy; radio pulses; lean payroll |
| **Primary scale** | **$450k – $900k** | County mail pilots; APA digital; first stipend grid |
| **General** | **$1.0M – $2.2M+** | Sustained radio/newspaper; GOTV mail; possible TV in select markets if bought efficiently |

*Replace endpoints when finance publishes **official budget** — this lane stays **directionally** tight.*

### 4.2 Category mix (% of spend, not cumulative to 100% slack = contingency)

| Category | Bootstrap phase | General phase |
|----------|-----------------|---------------|
| **Travel, vehicle, per-diem field** | **28% – 38%** | **18% – 28%** |
| **Paid media (radio, digital, print ads)** | **12% – 22%** | **34% – 46%** |
| **Direct mail (persuasion + GOTV)** | **4% – 8%** | **14% – 22%** |
| **Merch, booths, printing, fair fees** | **10% – 16%** | **8% – 14%** |
| **People (payroll, stipends, contractors)** | **18% – 28%** | **14% – 22%** |
| **Professional (legal, accounting, compliance)** | **6% – 10%** | **4% – 8%** |
| **Technology, data, voter file** | **2% – 5%** | **3% – 6%** |
| **Contingency + GOTV reserve (segregated)** | **≥ 10%** | **≥ 15%** from **T-60** onward |

### 4.3 GOTV lockbox (cash)

| Phase | Minimum **cash reserved** before **T-21** |
|-------|------------------------------------------|
| Bootstrap | **$35,000 – $75,000** |
| Primary scale | **$75,000 – $125,000** |
| General | **$120,000 – $250,000** |

*Finance adjusts against **mail quote** and **paid media** contracts.*

### 4.4 Commission / local promoter pool

| Rule | Value |
|------|--------|
| **Cap** | **≤ 8%** of **monthly gross receipts** (hypothesis) — **counsel sets final** |
| **Accrual** | Book weekly; pay semi-monthly after **performance attestation** |

### 4.5 Weekly burn guardrails (Bootstrap illustration)

| Line | Typical weekly range (planning) |
|------|----------------------------------|
| Candidate travel (net of reimbursement) | **$2,000 – $6,500** |
| Field supplies + merch ship | **$400 – $2,500** |
| Digital ads (pulses) | **$0 – $4,000** |
| Payroll + stipends | **scaled to headcount** |

---

## 5. Field capacity targets (tie to victory math)

| Role | Tier 1 counties (each) | Tier 2 (each) | Statewide |
|------|------------------------|---------------|-----------|
| **County coordinator** | **1 named** | **1 part-time or paired** | **75** filled → synthetic regions OK |
| **Volunteer “molecules” (5-person)** | **≥ 8 active / Tier 1** | **≥ 3** | **≥ 400 active** planning |
| **LTE writers on roster** | **≥ 6** | **≥ 2** | **≥ 120** |
| **GOTV shift leads** | **≥ 12 per Tier 1** | **≥ 4** | **≥ 200** E-week |

---

## 6. GOTV master backward plan (integrated clock)

**Anchor:** Replace **calendar dates** with Arkansas **official** early vote, absentee, and Election Day for this cycle. All programs (registration, persuasion, media, relational, digital) **pitch increases** into these windows.

### 6.1 T-minus phases (summary)

| Gate | Time | Objective |
|------|------|-----------|
| **GOTV-0** | **E-Day** | Lawful visibility; voter assistance; rapid response |
| **GOTV-1** | **E minus 1** | Final reminder; ride offers; static at predictable spots |
| **GOTV-2** | **E minus 2** | Persuasion closed except **soft**; 100% vote-plan confirmation |
| **GOTV-4** | **96h** | Riders, shifts, weather pack; logistics command active |
| **GOTV-7** | **Final week** | Surge contact; double dials; **SOS name** in every script |
| **GOTV-21** | **3 weeks** | Early vote chase begins; digital + SMS/email cadence peaks |
| **GOTV-42** | **6 weeks** | Mail landing; radio continuity; volunteer shift signup opens |
| **GOTV-56** | **8 weeks** | GOTV captains named; inventory audit; training schedule |

### 6.2 Program integration matrix (what each lane does when)

| Program | T-56 to T-42 | T-42 to T-21 | T-21 to T-7 | T-7 to T-2 | T-48h to E |
|---------|--------------|--------------|-------------|------------|------------|
| **Registration** | Partner density | Last lawful pushes pre-deadline | **Stop** at deadline | Closed | Closed |
| **Turnout gap cohorts** | ID + first touch | Second touch + vote plan | EV chase | Confirm plan | Rides + thank |
| **Persuasion** | Mail + digital + gatherings | Mail drops | **Light** after T-7 | **Minimal** | None |
| **Youth** | School + grad | Vote plan parties | Dorm messaging | Peer text surge | Campus visibility if allowed |
| **Relational / hosts** | Recruit captains | House meetings | “Bring voter” meals | Phone tree | Day-of bottled water |
| **Comms / media** | Story arc to SOS | Frequency up | **hours/locations** creative | **Only** approved GOTV | Safety + gratitude |
| **Collateral** | Inventory audit | Ship **GOTV packs** | Restock | Emergency print run budget | E-Day kits |
| **County parties / institutional** | Captains picked | Training | Joint visibility | Flake check | Legal co-locate |
| **Faith / coalition** | Pulpit informational | GOTV ask (where legal) | Rides | Elder check-ins | Respect services |
| **Fundraising** | **GOTV match** asks | Reserve release approval | **No** new risky spend | Ops only | Close books shift |

### 6.3 Daily E-week cadence (command rhythm)

| Day | Command priorities |
|-----|---------------------|
| **E-7** | Shift roster **90%** staffed; lawyer + sheriff liaison numbers distributed |
| **E-5** | Weather contingency; outdoor sign staking plan |
| **E-3** | Flake fill from student athletes / church youth |
| **E-2** | **Sole focus:** vote plan + rides |
| **E-1** | Visibility only; calm messaging; **no** new experiments |
| **E-Day** | 05:30 standup; 12:00 turnout pulse; 19:00 debrief skeleton |

### 6.4 Metrics (GOTV scoreboard)

| Metric | T-21 target | E-Day target |
|--------|-------------|---------------|
| Vote plans logged (where tool permits) | **≥ 35,000** statewide planning | **≥ 55,000** |
| Volunteer shifts filled | **70%** | **95%** |
| Tier 1 counties with visible presence | **100%** | **100%** |
| Hotline incidents resolved **< 30 min** | — | **≥ 90%** |

*Numbers are **planning** — Data replaces from CRM/GOTV exports.*

---

## 7. Primary → general pivot (budget + targets)

| Item | Action |
|------|--------|
| **Margin model** | Re-run §1 scenarios with **new** turnout assumption |
| **Registration** | Carry forward remaining goal; **do not** zero out Tier 3 |
| **Media** | Reserve **40–50%** of general digital budget for **post-primary** eight weeks |
| **GOTV lockbox** | Top up to §4.3 general band **within 14 days** of primary |

---

## 8. Changelog

| Date | Change |
|------|--------|
| 2026-05-08 | v1.1 — Initial **LANE** with victory math, 50K reg, county tiers, budget mix, GOTV matrix |
| 2026-05-08 | v1.1 (same day) — Expanded manual cross-references; **`§6`** remains authoritative backward plan for all programs |

---

*End of numbers lane.*
