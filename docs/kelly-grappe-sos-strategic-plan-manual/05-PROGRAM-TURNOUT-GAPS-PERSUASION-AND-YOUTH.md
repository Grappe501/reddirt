# Program: turnout gaps, persuasion, and youth

**Targets:** **Margin allocator** by county tier (**LANE §1.2**); **vote plan** scoreboard (**LANE §6.4**); capacity **LANE §5**.  
**GOTV:** **[`LANE §6.2`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)** program matrix — rows **Turnout gap**, **Persuasion**, **Youth**.

---

## Part A — Presidential / midterm / primary turnout gap

### Problem statement

Electoral participation **drops** from peak presidential contexts to **midterms** and **off-cycle** environments. The campaign defines **gap voters** in a **written SOP** (vendor fields + lawful definitions) and aims **Tier 1** counties to bear **most** marginal turnout lift — **LANE §1.2**.

### Data approach (lawful and ethical)

1. **Voter file + vendor scores** — license- and law-compliant only.  
2. **Cohort definition** — document and train; refresh **T-42** and **T-21**.  
3. **Humility** — scores are **probabilistic**.

### Field approach

1. **First-party list** — consent-aware; match to file for **gap** tagging.  
2. **Relational** — Power of Five **specific** ask: name **three** low-mid voters they will text **T-7**.  
3. **Local hooks** — fairs and schools feed **touch calendar** ending at **vote plan**.

### Tier intensity

| Tier | Gap cohort touch goal (planning, per active voter in universe) |
|------|------------------------------------------------------------------|
| **Tier 1** | **≥ 3** meaningful contacts Jul–Oct equivalent window |
| **Tier 2** | **≥ 2** |
| **Tier 3** | **≥ 1** digital + **1** mail piece if budget allows |

### Tool mapping

- RedDirt: `VoterRecord`, signals, **`/admin/gotv`**, `VoterVotePlan`.  
- Future GOTV-3+ assignment — until then **exports + tasks**.

### GOTV integration

| Gate | Turnout gap program |
|------|---------------------|
| **T-42** | Second-touch completion **≥ 70%** of Tier 1 gap universe (hypothesis) |
| **T-21** | **Early vote chase** begins; scripts include **hours + sites** |
| **T-7** | **100%** vote-plan verification shift for **identified supporters** |
| **T-48h** | **Rides** and **weather** messages only for stragglers |

### Metrics

- Reach; second-touch rate; **EV** utilization where observable; **county** turnout delta post hoc.

---

## Part B — Persuasion (independents and soft partisan)

### Objective

Deliver **LANE** planning margin from persuasion **chiefly in Tier 1–2** — competence + local validators.

### Universe and inventory

- **Counsel-approved** definitions; **no** volunteer-facing “secret score” talk.  
- **Mail + digital + gatherings:** weighted per **budget** — **LANE §4.2**.

### Message strategy

- **Reassurance + competence** — SOS duties, transparency, access.  
- ** validators** — only **real** endorsements.

### GOTV integration

| Gate | Persuasion |
|------|------------|
| **T-42 → T-7** | Mail landing; digital rotation; **gatherings** emphasize **SOS** choice |
| **T-7** | **Freeze** new persuasive arguments — pivot to **plan + logistics** |
| **T-48h** | **Off** except **passive** digital retargeting if counsel allows |

### Metrics

- ID/support shifts where measured; event attendance from target ZIPs; **cost per ID**.

---

## Part C — Youth (seniors through college freshmen)

### Objective

**Registration** early + **vote plan** before summer churn; **Tier 1** counties run **grad-season surge**.

### Tactics

1. **Schools** — civics partnership; respect rules.  
2. **Peer hosts** — **T-21** TikTok/Reels “vote together” **if** counsel OKs.  
3. **Parents** — **T-7** email to **household** opt-ins only.  
4. **Move** — dorm address updates **T-28** push.

### County allocation

- Colleges located in **Tier 1** get **duplicate** goal: **youth regs** + **youth vote plans** tracked separately in scorecard (**Part 16**).

### GOTV integration

| Gate | Youth |
|------|-------|
| **T-21** | Campus **early vote** tables **where permitted** |
| **T-7** | **Peer text surge**; professor/chapel **informational** (non-partisan where required) |
| **E-Day** | **Visibility** outside buffer; **no** academic penalty risk behaviors |

### Metrics

- **18–24** slice deltas; school event count; pledge cards.

---

## Risks

- **Compliance** — paid persuasion disclaimers; school policies.  
- **Universe drift** — refresh at **T-42** and **T-21**.  
- **Youth mobility** — address MVPs **early**.
