# Website cleanup, motion, and live platform plan — Manual Pass 5D

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** Doctrine for the public **site** and **feeds** — not a substitute for engineering tickets.  
**Cross-ref:** `ELECTION_CONFIDENCE_TRANSPARENCY_AND_GET_UNDER_THE_HOOD_DOCTRINE.md` (election confidence is one chapter, not the only story)

**Product honesty:** `SYSTEM_READINESS_REPORT.md` — OIS, member dashboards, and some feeds may be **placeholder** or **mixed** **demo** / **live**; **verify** **provenance** before calling anything “current operations.”

---

## 1. What this is not

- **Not** replacing the whole site with election-security or fraud-adjacent copy. **Service**-first SOS message stays **first**; trust/FAQ is a **bounded** section.  
- **Not** a guaranteed shipped product — this file is the **agreed** intent before MCE/NDE/owner schedule implementation.

---

## 2. Website cleanup (post-manual)

| Goal | Tactic |
|------|--------|
| **Remove redundancy** | One canonical page per major theme; merge overlapping policy and ethics where counsel allows. |
| **Highlight accomplishments** | Front and chapter pages: tangible wins, coalitions, travel/tour, service **SOS** — not only defensive news. |
| **Kelly “everywhere / all the time” (creative direction)** | Consistent photography/video cadence, human **motion** over static walls; no stock-only if real assets exist (NDE). |
| **Motion = emotion** | Subtle **motion** in hero/sections, **event** strips, **county** or **tour** tickers with **OIS**-**honest** data only (no **fake** coverage). |
| **Trust** | A clear nav path to the SOS/FAQ/“under the hood” **slice**, not a takeover of the **hero** (doctrine). |

---

## 3. Backend-connected “live” **platform** doctrine (design)

**Intent:** The public experience **feels** current when tied to real operations, within LQA and readiness — not a stale brochure.

| Feed (target) | Source of truth (when wired) | Guards |
|---------------|------------------------------|--------|
| **Events** | `CampaignEvent` + GCal SOP; festival ingest if used | No ghost public events; reconcile per `WORKBENCH_OPERATOR_RUNBOOK.md` |
| **Field / regional pulse** | OIS, regions, **honest** county signals | Seeded or demo = **label**; see readiness report |
| **Stories / news** | MCE/NDE-shipped content | LQA, defect=0 for public |
| **County / tour / huddle** | Workbench-fed public cards (subset) or static with “last updated” | No invented meeting **chairs** or **dates** (3F) |
| **Volunteer pathways** | P5, V.C. CTAs; 5C starter deck when product exists | No public VFR; `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` |
| **Optional** **aggregate** **“pulse”** | e.g. open-work or milestone counts (design only) | **Suppress** if misleading; may remain **mock** in code |

**Bridge:** `WorkflowIntake` / `CampaignTask` for any **proposed** public **surface**; no auto-execution of sensitive work (`STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md`).

---

## 4. Where **election** **confidence** **sits** on the **site**

- **Hero** — service-first (what a modern SOS does for every voter) + one short **trust** line, not a long audit monologue.  
- **Dedicated** **SOS** / “**under the hood**” / **FAQ** page — `KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md` content, with **SBEC** + **EPI** as **cited** links; refresh when those sources **update** (MI §41).  
- **Training** / **Pathway** **copy** (M-001, etc.) — can nod to “we take process seriously” without making **fraud** the **onboarding** **litmus** for volunteers (`SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` 5D lane).

---

## 5. Review cadence

- **Before** any new paid/earned line citing **EPI** or **SBEC:** run the checklist in `KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md` §7.  
- **Periodic** (owner + MCE + comms): provenance audit of **“live**” or **OIS**-driven public modules — **R/Y/G** in plain language, not a fake “always green” strip.

---

**Last** **updated:** 2026-04-28 (Pass 5D)
