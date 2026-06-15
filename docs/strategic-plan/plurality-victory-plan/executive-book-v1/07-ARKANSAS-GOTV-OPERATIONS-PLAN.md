# Arkansas GOTV Operations Plan

> GOTV-OPERATIONS-PLAN-1.0 · **Executive Book Chapter 8 — Field manual**

**Election Day:** 2026-11-03 · **Early voting begins:** 2026-10-20

> It is October 19. How exactly do we win Election Day? **This chapter answers that question.**

Field operations manual — planning document. Assign owners before execution. Not legal advice. Not individual voter targeting automation.

---

## Section 1 — Win Condition

To win Arkansas Secretary of State in a three-candidate plurality race:

1. **Hold Democratic base vote** — Lane 1 retention
2. **Recover 51,051 drop-off voters** — Lane 2 reactivation @ 50%
3. **Register 50,000 new voters** — Lane 3 registration
4. **Convert targeted Republicans and Independents** — Lane 4 persuasion
5. **Turn those voters into ballots** — GOTV execution

### Election Day success

```
Election Day success = Ballots Cast
```

Human Contact Index (250,000 goal) measures **relationship depth**. GOTV measures **ballots**. Both are required.

---

## Section 2 — Target Universe

| Tier | Universe | GOTV priority |
|------|----------|---------------|
| **Tier 1** | Top 10 Cities | Highest — daily contact Sep–Nov |
| **Tier 2** | Top 40 Cities | High — weekly contact cycles |
| **Tier 3** | Delta Corridor (8 counties) | High — repeat contact + NAACP/educator networks |
| **Tier 4** | County Completion counties | Medium — captain-led local ops |
| **Tier 5** | Statewide low-propensity Democrats | Ongoing — phone · postcard · Power of 5 |

### Tier 1 — Top 10 Cities

- Little Rock
- Fayetteville
- Springdale
- North Little Rock
- Fort Smith
- Rogers
- Conway
- Pine Bluff
- Jonesboro
- Bentonville

### Tier 2 — Top 40 Cities

- Little Rock
- Fayetteville
- Springdale
- North Little Rock
- Fort Smith
- Rogers
- Conway
- Pine Bluff
- Jonesboro
- Bentonville
- Sherwood
- Jacksonville
- Hot Springs
- Benton
- Bella Vista
- Maumelle
- West Memphis
- Texarkana
- Russellville
- El Dorado
- Cabot
- Bryant
- Paragould
- Van Buren
- Siloam Springs
- Blytheville
- Searcy
- Marion
- Forrest City
- Mountain Home
- Arkadelphia
- Harrison
- Magnolia
- Malvern
- Camden
- Batesville
- Wynne
- Stuttgart
- Hope
- Beebe

### Tier 3 — Delta Corridor

- Crittenden
- Mississippi
- St. Francis
- Phillips
- Monroe
- Chicot
- Ashley
- Lincoln

Leadership doctrine: all 8 touched once · repeat Crittenden · Phillips · Jefferson · St. Francis.

### Tier 4 — County Completion

All 75 counties via County Strike Teams (75 county records). Priority: counties with vacant captain roles before Election Day.

### Tier 5 — Low-Propensity Democrats

Lane 2 drop-off pool statewide — prioritize through Power of 5 trusted-network conversations before mass GOTV.

---

## Section 3 — GOTV Timeline

| Phase | Dates | Mode | Primary channels |
|-------|-------|------|------------------|
| **Persuasion** | Sept 1–15 | Relationship · story · forums | Events · Power of 5 · coalition |
| **Commitment** | Sept 15–30 | Vote plan · volunteer ask | Phone · house parties · Mobilize |
| **Ballot Chase** | Oct 1–18 | Confirm vote plan · chase absentee | Phone · postcard · canvass |
| **Early Voting** | Oct 20–Nov 2 | Turnout | GOTV calls · poll greeters · shifts |
| **Final 96 Hours** | Oct 31–Nov 2 | Full GOTV | All channels · war room |
| **Election Day** | Nov 3 | Turnout operations | Poll coverage · candidate routing · hotline |

20-week plan anchors: **Oct 19** statewide GOTV sprint launch · **Oct 20** early voting · **Nov 3** Election Day.

---

## Section 4 — Human Contact Ladder

Every target voter should move through:

```
Story → Event → Volunteer → Phone → Postcard → Door → Vote Plan → Ballot
```

| Rung | Owner | Data source |
|------|-------|-------------|
| Story | Motion & Storytelling | story-pipeline.json |
| Event | Forward Motion / Mobilize | mobilize-events.json |
| Volunteer | People Power | people-power-network.json |
| Phone | Phone Bank Captain | phone-banks-field.json |
| Postcard | Postcard Captain | postcards-field.json |
| Door | Canvass Captain | canvass-field.json |
| Vote Plan | County Captain | county-strike-teams.json |
| Ballot | GOTV Lead | voter-contact-tracks.json |

HCI current: **0** / 250,000 — ladder rungs must produce measurable movement weekly.

---

## Section 5 — Volunteer Deployment (Planning Targets)

Statewide channel goals from Phase 16 voter contact system. Weekly planning targets assume **9 execution weeks** (Sept 1 – Nov 3).

| Channel | Total goal | ~Weekly target | Owner |
|---------|----------:|---------------:|-------|
| Phone calls | 29,000 | 3,222 | Phone Bank Captain |
| Postcards mailed | 48,000 | 5,333 | Postcard Captain |
| Doors knocked | 60,000 | 6,667 | Canvass Captain |
| Power of 5 conversations | 25,000 | 2,778 | Volunteer Captain |
| GOTV contacts (final week) | 15,000 | 7,500 (final 2 wks) | GOTV Lead |
| Founding leaders | 20 | 2–3/week through Jun 28 | Volunteer Leadership |

**Status:** Planning targets — assign county-level quotas after founding 20 launch.

---

## Section 6 — County Captain Model

Every county uses the County Strike Team structure (75 counties · 75 records):

| Role | Strike team field | Status if vacant |
|------|-------------------|------------------|
| County Captain | countyCaptain | **Recruit before Labor Day** |
| Phone Lead | phoneBankCaptain | Assign with founding team |
| Postcard Lead | postcardCaptain | Assign with founding team |
| Volunteer Lead | volunteerCaptain | Assign with founding team |
| Event Lead | eventsCaptain | Assign with founding team |
| Social Lead | mediaCaptain | Assign with founding team |
| Canvass Lead | canvassCaptain | Assign Sep 1 |
| Faith Lead | faithCaptain | Coalition sprint |

Edit: `data/campaign-brain/county-strike-teams.json` → `npm run campaign-brain:build`

---

## Section 7 — Election Week Command Structure

| Function | Primary owner | Status |
|----------|---------------|--------|
| Poll watchers | **needs_assignment** | Train T-30 |
| Poll greeters | County Captains | Recruit Oct 1 |
| Election protection | **needs_assignment** | Legal review required |
| Voter hotline | **needs_assignment** | Stand up Oct 15 |
| Social media war room | Motion & Storytelling owner | **TBD** in ownership matrix |
| Candidate routing | Steve + Kelly | Lock Oct 12 |
| War room lead | Ernie / campaign manager | **needs_assignment** |
| Turnout tracking | Weekly scorecard + GOTV dashboard | Live Oct 20 |

---

## Section 8 — Sherwood GOTV Launch

**Win Sherwood outright with 60%+**

| Element | Detail |
|---------|--------|
| Event | Sherwood GOTV Kickoff · Grassroots & Guitar Strings |
| Frame | Sherwood GOTV · Central Arkansas kickoff · statewide momentum |
| VIP tables | $1000 · goal 20 |
| Show tickets | $25 |
| Strategic role | **Official launch of statewide GOTV phase** after Labor Day readiness gate |
| July 3–4 corridor | Sherwood Fireworks · Pops on the River — locked backbone |

Sherwood is not a side event. It is the Central Arkansas GOTV kickoff that signals statewide turnout operations have begun.

---

## Section 9 — Daily GOTV Metrics

Track daily during GOTV phase (Oct 1 – Nov 3). Not campaign vanity metrics — **ballot chase metrics**.

| Metric | Planning goal | Current |
|--------|-------------:|--------:|
| Calls completed | 29,000 | 0 |
| Conversations (HCI) | 250,000 | 0 |
| Postcards mailed | 48,000 | 0 |
| Doors knocked | 60,000 | 0 |
| Mobilize RSVPs | — | 0 |
| Volunteer shifts filled | — | 0 |
| Early vote commitments | — | 0 |
| **Ballots cast** | Plurality coalition | **Election Day truth** |

Rebuild live counts: `npm run campaign-brain:voter-contact:build`

---

## Section 10 — Election Day Plan

### Poll Opening Checklist — needs_assignment

- [ ] Poll greeters assigned per priority precinct
- [ ] Poll watcher credentials confirmed (legal review)
- [ ] Candidate visibility plan confirmed
- [ ] Hotline staffed and tested
- [ ] Turnout tracker live

### Poll Coverage Map — needs_build

Priority: Top 10 cities · Sherwood · Delta population centers. Map links to county strike teams.

### Candidate Schedule — locked backbone

Follow locked events Oct 20–Nov 3 early voting window. Election Day routing: **needs_lock** by Oct 12.

### War Room Structure

| Time | Lead | Function |
|------|------|----------|
| 6:00 AM | War room lead | Open · turnout baseline |
| 7:00 AM–7:00 PM | County captains | Poll reports every 2 hours |
| 7:00 PM | Leadership | Closing poll push |
| 8:00 PM+ | Ernie + Kelly | Results night |

### Incident Escalation

1. County Captain → War room lead
2. War room lead → Legal / Ernie
3. Media incidents → Motion & Storytelling owner

### Turnout Tracking

Compare hourly ballots cast vs. planning model. Delta + Top 10 + Sherwood reported separately.

### Closing Poll Operations

Final two hours: all volunteer shifts · candidate thank-yous · social content capture.

### Results Night

Central watch location · coalition validators invited · no premature claims until AP/county calls.

---

## Rebuild

```bash
npm run campaign-brain:gotv-operations:build
npm run campaign-brain:voter-contact:build
npm run election-plan:build
```

Shareable chapter: `/election-plan/executive-book/gotv`
