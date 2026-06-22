# Kelly debate prep — Day 6 five-pass build plan

**Doc ID:** KELLY-DP-D6-5PASS  
**Lane:** `RedDirt/` only  
**Status:** Day 1–6 **production parity signed** · Day 6 **v1.0.0** on `2026-06-24` hub  
**Created:** 2026-06-22  
**Goal:** Bring **Day 6 · Full simulation** to Kelly-facing production parity — one linear pathway, **opening → traps → SOS → closing** dress rehearsal, APA statewide broadcast framing, debrief + readiness audit, **no admin detours** on the minimum path.

---

## How to use this doc

Work **one pass at a time**. Do not start Pass N+1 until Pass N exit criteria are met. After each pass:

1. Run `npm run typecheck` from `RedDirt/`.
2. Walk the Day 6 pathway in browser (election-plan password).
3. Append a one-line note under **Pass log** at the bottom.
4. Commit with message prefix `debate-prep day6 pass N:`.

---

## Gap analysis (why Day 6 exists)

Days 2–5 built **pieces**; Day 6 **integrates** them under fatigue:

| Skill | Where built | Day 6 job |
|-------|-------------|-----------|
| Opponent tells | Day 2 film briefs | Used in sim — not re-watched |
| Trap lanes 1–2 | Day 2 | Woven into sim script |
| Qualification stack | Day 3 | Opening + SOS answers |
| Forum intel + notecard | Day 4 | Triggers in sim |
| When-X-say-Y pairs | Day 5 | Live under moderator pace |
| Trap lanes 3–6 + pile-on | Day 5 | Sim stress test |
| **90s opening** | **Day 1 only** | **Full sim bookend — needs EP module** |
| **60s closing** | **Day 7 data only** | **Pull forward into Day 6 sim** |
| Three-way geometry | Day 2 / Day 7 psych | Sim staff plays Hammer + Pakko |
| APA statewide audience | Day 5 framing | Sim debrief: “whole state watching” |

**Video overwhelm:** Fixed for Days 2–3 (transcript briefs, no required YouTube). Days 4–5 are text/timer. Day 6 must **not** reintroduce multi-hour video — sim is **speak-aloud** only.

---

## Days 1–5 bar (what Day 6 must match)

| Layer | Day 1–5 pattern | Day 6 target |
|-------|-----------------|--------------|
| Day identity | `DAY{N}_ID` in `debatePrepDayDrillDown.ts` | `DAY6_ID = "day-6-full-simulation"` |
| Linear pathway | `day{N}-learning-pathway.ts` | `day6-learning-pathway.ts` |
| Block study | `debatePrepDay{N}BlockStudy.ts` | `debatePrepDay6BlockStudy.ts` (5 blocks) |
| Example study | optional | `debatePrepDay6OpponentExampleStudy.ts` if needed |
| Registry | `debatePrepDay{N}Registry.ts` | `debatePrepDay6Registry.ts` |
| Pathway UI | `ElectionPlanDay{N}PathwayPanel.tsx` | `ElectionPlanDay6PathwayPanel.tsx` |
| Step footers | `ElectionPlanDayStepFooter` + Continue | Extend for `DAY6_ID` |
| Product UI | Day 4 pipeline, Day 5 timers | **Day 6 sim runner + bookends + debrief** |
| Supplement anchors | `day{N}-supplement-anchors.ts` | `day6-supplement-anchors.ts` |
| Parity test | `test-debate-prep-day-parity.ts` | Extend to Day 6 |
| Release tag | `debate-prep-day{N}-release.ts` | `debate-prep-day6-release.ts` → `v1.0.0` |
| Hub primary day | `debatePrepHubPrimaryDayId()` | Include Day 6 on `2026-06-24` |

**Kelly success test (Day 6):** One **60-minute three-way simulation** complete (staff as Hammer + Pakko); **opening + closing** each rehearsed once inside sim; top **3 fixes** logged; Day 5 when-X-say-Y sheet used live at least **3 times**; no new stats or unverified quotes; optional readiness audit shows no BLOCKED lines in sim script.

---

## Day 6 content spine (already in repo)

Source of truth: `debateWeekIntensive2026.ts` + `debateWeekIntensive2026Deep.ts` + `debateWeekIntensive2026V3.ts`.

| Field | Value |
|-------|-------|
| **dayId** | `day-6-full-simulation` |
| **Calendar** | Tuesday · 2026-06-24 |
| **Title** | Full simulation — prep window opens |
| **Subtitle** | 60-minute debate dress rehearsal |
| **Command mode** | Execute under fatigue — Command Mode is muscle memory, not inspiration |
| **Psychology** | Stress inoculation — worst-case drills in safe room |
| **Goal** | Run full simulation: opening, three trap lanes, five SOS questions, closing — staff plays Hammer and Pakko |
| **Hours** | ~5 |
| **Success check** | Simulation complete; debate command readiness ≥70% all dimensions |
| **Minimum tonight** | `b6-sim` block only — bios lock-in + debrief roll to Wed AM if tired |

### Blocks (pathway order — EP mirrors, no admin on Kelly path)

| Order | Block ID | ~min | EP mirror (build) | Kelly activity |
|-------|----------|------|-------------------|----------------|
| 1 | `b6-opponent-bios-lock` | 30 | Opponent bios EP + memory-line checklist | Third read: memory lines only, speak aloud |
| 2 | `b6-sim` | 90 | **`ElectionPlanFullSimulationRunner`** | 60-min three-way sim + 30-min debrief |
| 3 | `b6-prep` | 90 | Trap/SOS pocket cards from Days 2–5 | Highest trap-density review — no new research |
| 4 | `b6-command` | 45 | **`ElectionPlanReadinessAuditPanel`** | Blocked lanes cut from sim script |
| 5 | `b6-depth` | 30 | If-stuck bridges + `d6-stuck-bridge` drill | Three bridges memorized |

### Pathway tail (suggested)

| Step kind | ID | Label |
|-----------|-----|-------|
| micro-lesson | `d6-stress` | Stress inoculation (6 min) |
| command-drill | `d6-stuck-bridge` | If unexpected / pile-on — bridge to clerks |
| rehearsal | `rehearse-open-close-sim` | Opening 90s + closing 60s inside sim frame |
| close | `evening-close` | Evening success check |

### V3 lanes (stretch — link from block study)

| Lane ID | Tier | Tie-in |
|---------|------|--------|
| `lane-d6-full-sim` | essential | `b6-sim` |
| `lane-d6-readiness` | deeper | `b6-command` |
| `lane-d6-stuck-stretch` | stretch | `b6-depth` |

---

## Opening & closing — Day 6 product requirement

Day 1 owns **first draft** (`rehearse-opening-90s`). Day 7 owns **polish** (`b7-open-close`). Day 6 must **integrate both bookends into the sim** so Kelly understands what she is trying to get across **to the APA statewide broadcast audience**:

### Opening module (`ElectionPlanDebateBookendsPanel` — variant `opening`)

| Beat | Content source | Kelly job |
|------|----------------|-----------|
| 1 | Day 1 `rehearse-opening-90s` script | Administrator frame — no opponent names |
| 2 | Day 3 qualification stack (3 beats) | Business proof + clerk partnership |
| 3 | Forum Kelly lines (Day 3 briefs / Day 4 notecard) | Tone match ACCA — “do this the right way” |
| Timer | 90s hard stop | Speak to **camera / statewide**, picture press row |
| Claims | Green only | No new stats |

### Closing module (variant `closing`)

| Beat | Content source | Kelly job |
|------|----------------|-----------|
| 1 | Day 7 `d7-close` command drill template | Clerk invoke — administrator promise |
| 2 | Day 5 weakest lane fix | One sentence from sim debrief |
| 3 | Optional quotable (Day 7 preview) | One breath pause before last word |
| Timer | 60s | **Peak-end rule** — papers remember the last calm minute |

**Not built today:** No dedicated EP opening/closing **module** beyond Day 1 rehearsal step and Day 4 optional 60s recovery. Day 6 Pass 4 creates the **first integrated bookends UI**.

---

## APA statewide broadcast framing (carry from Day 5)

Use `DAY5_APA_STATEWIDE_BROADCAST_FRAME` as template → add `DAY6_APA_SIM_FRAME`:

> Fail in the room with staff, not on the APA statewide broadcast. Clerks belong in your lines; voters and press belong in your tone — calm, specific, quotable without gimmick.

Sim runner UI shows: **Audience: Arkansas Press Association broadcast + local Carroll paper + clerks grading competence.**

---

## Five-pass execution

### Pass 1 — Pathway spine & drill-down registry

**Theme:** `DAY6_ID` exists; Kelly can navigate Day 6 routes.

**Files to add**

- `src/lib/election-plan/day6-learning-pathway.ts`
- `src/lib/election-plan/debatePrepDay6Registry.ts`
- `src/lib/election-plan/debatePrepDay6BlockStudy.ts` (stub phases)
- `src/lib/election-plan/debate-prep-day6-release.ts` → `pass1`
- Extend `debatePrepDayDrillDown.ts` — `DAY6_ID`, `DRILL_DOWN_DAY_ID_SET`
- Extend `debatePrepBlockPhase.ts`, `debatePrepDayStaticParams.ts`
- `scripts/test-debate-prep-day6-pathway.ts`

**Exit criteria**

- [ ] 5 blocks + tail steps in pathway
- [ ] Static params for blocks, concepts, drills, micro-lessons, rehearsal
- [ ] Day 6 day landing renders (generic OK for Pass 1)

---

### Pass 2 — Block study guides & sim script spine

**Theme:** Phased study for all 5 blocks; sim script outline documented in code.

**Files to add / extend**

- Full `debatePrepDay6BlockStudy.ts` — phases, claimsGate, deepSections
- `src/lib/election-plan/debate-prep-day6-simulation-copy.ts` — sim segments, debrief prompts
- `src/lib/election-plan/load-day6-simulation-surface.ts` — merges Day 5 pairs + trap lanes + SOS picks + Day 1 opening + closing template
- Extend `debatePrepBlockPhase.ts` — `getDay6BlockStudy`
- Bump release → `pass2`

**Sim segment shape (suggested)**

```ts
type Day6SimSegment = {
  segmentIndex: number;
  kind: "opening" | "trap" | "sos" | "closing" | "pile-on";
  label: string;
  timedMinutes: number;
  staffRole: "moderator" | "hammer" | "pakko";
  kellyObjective: string;
  sourceDayId: string; // traceability
};
```

**Exit criteria**

- [ ] All 5 blocks have ≥3 phases + claimsGate
- [ ] `load-day6-simulation-surface.ts` returns ≥8 segments including opening + closing
- [ ] Phase routes load for each block

---

### Pass 3 — Linear pathway UI & day landing

**Theme:** Same “one pathway” experience as Days 1–5.

**Files to add**

- `ElectionPlanDay6PathwayPanel.tsx`
- `ElectionPlanDay6PathwayProgressBar.tsx`
- `ElectionPlanDay6ContinueButton.tsx`
- `day6-pathway-progress.ts`
- Update `ElectionPlanDayDrillDownOverview.tsx`, `days/[dayId]/page.tsx`
- Update `ElectionPlanDebatePrepSubnav.tsx` — Day 6 tab
- `isKellyDay6StreamlinedPath()` in `kelly-facing-ui.ts`

**Exit criteria**

- [ ] Day 6 landing matches Day 5 visual weight
- [ ] Continue footers on all step types
- [ ] Day 5 review in `<details>` when Day 6 primary (hub Pass 5)

---

### Pass 4 — Full simulation product UI (core Day 6)

**Theme:** Kelly runs the dress rehearsal on election-plan — **opening → traps → SOS → closing** — with debrief log.

**Files to add**

- `src/components/election-plan/ElectionPlanDay6Panels.tsx` — orchestrator
- `src/components/election-plan/ElectionPlanFullSimulationRunner.tsx` — segment timer, staff role cards, progress through sim
- `src/components/election-plan/ElectionPlanDebateBookendsPanel.tsx` — opening 90s + closing 60s modules with “what you’re trying to get across” copy
- `src/components/election-plan/ElectionPlanSimDebriefLog.tsx` — top 3 fixes, agree-only close flag, weakest segment
- `src/components/election-plan/ElectionPlanReadinessAuditPanel.tsx` — EP mirror of blocked lanes (from debate command scores if available; else checklist)
- `src/components/election-plan/ElectionPlanBiosLockInChecklist.tsx` — memory lines per opponent
- `src/lib/election-plan/day6-supplement-anchors.ts` + `ElectionPlanDay6SupplementFooter.tsx`
- Wire into block pages; rehearsal `rehearse-open-close-sim`

**Exit criteria**

- [ ] Sim runner pre-fills from Day 5 sheet + Day 4 SOS map
- [ ] Opening + closing modules explain **audience** (APA broadcast) and **objective** per beat
- [ ] Debrief captures top 3 fixes in localStorage
- [ ] No `/admin/` links on minimum pathway
- [ ] Mobile-first card stacks

---

### Pass 5 — Hub integration, parity test, production sign-off

**Theme:** Hub promotes Day 6 on `2026-06-24`; Steve sign-off.

**Files to touch**

- `debate-prep-hub-tonight.ts` — `DAY6_ID` on `2026-06-24`
- `ElectionPlanDebatePrepHubPanel.tsx` — Day 6 start card; Day 5 review in `<details>`
- `debate-prep-day6-release.ts` → **`day-6-full-simulation-v1.0.0`**
- `debate-prep-system-v8.ts` — bump Day 6 version string
- Extend `test-debate-prep-day-parity.ts` — Day 6 section
- Extend `test-debate-prep-day6-pathway.ts` — assert v1.0.0

**Exit criteria**

- [ ] Hub on 2026-06-24 promotes Day 6 with APA sim framing
- [ ] Parity test Day 6 green alongside Days 1–5
- [ ] `npm run typecheck` green
- [ ] Kelly walkthrough: minimum sim completable without admin login
- [ ] Release label documents Day 6 scope

---

## Test commands

```bash
cd H:/SOSWebsite/RedDirt && node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run agents:test-debate-prep-day-parity
node scripts/run-with-h-drive-env.cjs npm run agents:test-debate-prep-day6-pathway
node scripts/run-with-h-drive-env.cjs npm run agents:test-debate-prep-block-phases
```

Add to `package.json`:

```json
"agents:test-debate-prep-day6-pathway": "tsx scripts/test-debate-prep-day6-pathway.ts"
```

---

## Pass log

| Pass | Date | Commit / note |
|------|------|---------------|
| Plan | 2026-06-22 | Doc created — Days 2–5 gap analysis; Day 6 opening/closing + sim runner spec |
| 1 | 2026-06-22 | Pass 1 — pathway spine, registry, stub block study, day landing |
| 2 | 2026-06-22 | Pass 2 — full block study, simulation surface, sim copy |
| 3 | 2026-06-22 | Pass 3 — pathway UI, Continue footers, Day 6 subnav |
| 4 | 2026-06-22 | Pass 4 — sim runner, bookends, debrief, readiness audit (`b4de60cd`) |
| 5 | 2026-06-22 | Pass 5 — hub integration on 2026-06-24, parity test, v1.0.0 sign-off |

---

*End KELLY-DP-D6-5PASS*
