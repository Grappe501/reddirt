# Chapter 22 — Election Day command (and closing window: EV + late GOTV)

**Scope:** **Operating** view for the **last miles**; **compliance** (poll behavior, sign rules) is **jurisdiction**-specific and **not** in this file as legal advice.

## 1. What “command” can mean in this repo (today)

- **Workbench** + **tasks** + **GOTV** admin page (verify depth) + **comms** + **social** + **county** pages for **narrative** and **turnout** tone. **No** single `ElectionDayCommandCenter` with live precinct board was located in **Pass 2A** route pass.

## 2. Precinct and visibility

- **Sign holder / visibility** program design: `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`.  
- **OIS** **aggregate** only on public; **list**-mode for precinct strings when data allows (DATA-1).

## 3. Shift boards and assignments

- **`CampaignEvent`**, `EventSignup`, **`CampaignTask`** for assignments; **future** “shift” model may consolidate.

## 4. Incidents and rapid response

- **Social** and **email** workbench for intake; `WorkflowIntake` from social as designed; **crisis** **comms** **approval** in **RACI** (manual, not an API).

## 5. Ride needs, ballot issues

- **Phone** and **in-person** programs often **out-of-band**; if tracked, `CampaignTask` or `submission` to **triage** — **compliance** for legal advice to voters (not a bot script).

## 6. County → state rollup

- **OIS** state/region; **GOTV** **aggregate**; **no** public microtargeting.

## 7. Candidate schedule

- `CampaignEvent` + calendar; **comms** for **sudden** change — `CommunicationPlan` review path.

## 8. Communications approval

- **Comms** / **message** lead per **CANDIDATE_AND_CAMPAIGN_MANAGER_INTAKE_GAP_ANALYSIS.md**; **counsel** on sensitive.

## 9. Closing reports and post-**E**D preservation

- **Data retention** in **chapters/15** and **chapters/19**; **exports** **logged**; **opposition** and **narrative** **archive** in owned media and CMS as policy allows.

**Cross-links:** `workflows/DAY_ONE_TO_ELECTION_DAY...` (phases 14–17) · `inventories/ROUTE_INVENTORY` (`/admin/.../gotv`)

**Status:** **Pass 2B** — 2026-04-27
