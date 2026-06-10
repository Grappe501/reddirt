# Leadership Session — Strategic Frame (Facilitator)

**Use at 0:00–0:10** · Before county lists are debated  
**Purpose:** Separate three concepts leadership often conflates — conflation is what broke Sprint 0 (16 Critical, 46 High Opportunity, 66 Weak)

> The conflicts in [`LEADERSHIP_DRAFT_INPUT_KELLY.md`](../LEADERSHIP_DRAFT_INPUT_KELLY.md) (Sebastian vs Saline, Independence twice, visit tiers vs Critical) prove governance is working. Surface tension **before** the engine exists.

---

## The three questions (never merge in one debate)

| Dimension | Question | Drives |
|-----------|----------|--------|
| **Electoral importance** | How much does this county matter to victory? | Victory Map tier (Critical / Important / …) |
| **Opportunity** | How much additional vote growth is realistically available? | Marginal gain per dollar or hour |
| **Candidate deployment** | How often should Kelly physically appear? | Visit cadence (1 / 2 / 3 visits), immersion, seasons |

**Lock sheet mapping:**

| Dimension | Lock sheet |
|-----------|------------|
| Electoral importance | [`01-CRITICAL_COUNTY_LIST.md`](./01-CRITICAL_COUNTY_LIST.md) |
| Opportunity | [`03-OPPORTUNITY_DEFINITIONS.md`](./03-OPPORTUNITY_DEFINITIONS.md) |
| Candidate deployment | [`04-KELLY_CAPACITY_RULES.md`](./04-KELLY_CAPACITY_RULES.md) + visit tiers in draft input |
| Readiness (field state) | [`02-READINESS_DEFINITIONS.md`](./02-READINESS_DEFINITIONS.md) |

---

## Examples (same county, different dimensions)

**Pulaski**

| Dimension | Possible lock |
|-----------|---------------|
| Electoral importance | **Critical** — largest vote pool |
| Opportunity | Medium — saturated base, turnout lever |
| Kelly deployment | Fewer visits if surrogate + field density covers events |

**White**

| Dimension | Possible lock |
|-----------|---------------|
| Electoral importance | Important — not must-win |
| Opportunity | **High** — more marginal votes than some Critical counties |
| Kelly deployment | One or two visits depending on relationship window |

**Searcy**

| Dimension | Possible lock |
|-----------|---------------|
| Electoral importance | Important or Helpful — not necessarily Critical |
| Opportunity | Medium — data-dependent |
| Kelly deployment | **Three visits** — relationship-building, immersion, GOTV kickoff |

---

## One county can combine any tier on each axis

```text
County A:  Critical  ·  Medium Opportunity  ·  One Kelly visit
County B:  Important ·  High Opportunity    ·  Three Kelly visits
```

If leadership keeps these separate, Phase 2 (`resolveDeploymentPriority()`) stays explainable.

If leadership merges them, the engine will encode confusion.

---

## Readiness: adopt Unknown (strong recommendation)

Sprint 0 draft: Strong 2 · Moderate 7 · **Weak 66** — almost certainly missing information.

| Label | Meaning | Action |
|-------|---------|--------|
| **Strong** | Known organization exists | Deploy / sustain |
| **Moderate** | Partial organization | Support and grow |
| **Weak** | **Known** problem — verified | Intervention |
| **Unknown** | **Insufficient data** | Information gathering — do not treat as Weak in scoring |

```text
Weak:    We know there is a problem.
Unknown: We do not know enough.
```

Those require different field actions. Unknown must not multiply down deployment scores until validated.

---

## Winning theory — 15-word test

After the one-sentence draft is agreed in principle, ask:

> If we had to cut this theory to **15 words**, what remains?

Not because shorter is better — because the shortest version reveals the strategic core.

Example core:

```text
Maximize urban turnout while building lasting rural organizing infrastructure through listening and local leadership.
```

Exact wording matters less than forcing clarity.

---

## Success = clarity, not agreement

Do **not** measure success by unanimous comfort.

Measure success by whether **multiple people in the room** can explain plainly and consistently:

| Explain… | Example |
|----------|---------|
| Why these counties are Critical | "Pulaski is Critical because…" |
| Why these counties are **not** Critical | "White is Important because failure hurts but doesn't break the path…" |
| Why a county is High Opportunity | "Marginal persuasion headroom per Kelly hour…" |
| Why a county is **not** High Opportunity | "Saturated base; maintenance only…" |
| Why Kelly visits one county three times and another once | "Deployment tier ≠ electoral tier — Searcy is relationship immersion…" |
| How the campaign believes it wins | One locked sentence + 15-word core |

If those explanations hold across Kelly, CM, and field leadership, Phase 2 is ready.

---

## County chair standard (Phase 2 bar)

Add to every locked assumption — sign-off question:

> **Can a county chair understand this?**

Victory OS output eventually reaches county chairs, volunteer captains, field organizers, and regional leads.

If only developers understand the assumptions, the system fails operationally.

**Passing example (Kelly question):**

> "Why is Benton ranked above White this week?"

> Benton is ranked above White because it is **Critical**, has **high opportunity**, **moderate readiness**, and **higher urgency** this week.

A county chair should understand that logic immediately.

If they cannot, Phase 2 is not ready — simplify before shipping math.

---

## Facilitator close (before signatures)

1. Read the six locked decisions aloud.  
2. Ask: *Can a county chair understand this?* — if No on any item, revise wording before sign-off.  
3. Sign [`05-ASSUMPTION_SIGN_OFF.md`](./05-ASSUMPTION_SIGN_OFF.md).
