# Community Workbench — field training script

**Audience:** Local organizers, campus captains, program leads  
**Time:** ~10 minutes  
**Path:** `/election-plan/workbenches/[your-slug]`  
**Version:** v1.2 (post event run-of-show + assignment editing)

---

## Before you start

1. Open the Election Plan portal and sign in.
2. Set your **3-letter operator initials** in the top bar (whitelist: ask statewide lead if yours is not listed).
3. Bookmark your workbench URL — this is your team’s command center, not the county intelligence page.

---

## 10-minute walkthrough: run a local team meeting

### Minute 1 — Open the workbench

- Go to **Community Workbenches** and select your city, campus, or program.
- Read **Overall readiness** — it is a bottleneck radar, not a grade.
- If you see **ownership gaps**, assign a **Community Lead** first (Leadership section).

### Minute 2 — Leadership check

- Fill in **Community Lead** and **Events Lead** at minimum.
- Add contact notes if helpful (phone/email — team-internal only).

### Minute 3 — Set this week’s mission

- **Local mission board:** add one mission with a clear outcome (e.g. “Confirm 15 volunteers for Saturday town hall”).
- Mark status `open` until done.

### Minute 4 — Create or open your next event

- **Events** section → **New event**.
- Title, date, location, expected attendance.
- Assign an **event lead** (required for field readiness).

### Minute 5 — Build the run-of-show

Add at least three rows, for example:

| Time | Segment | Owner |
|------|---------|-------|
| 5:30 | Doors / registration | Volunteer lead |
| 6:00 | Welcome + agenda | Community lead |
| 6:45 | Q&A | Events lead |

### Minute 6 — Assign volunteer roles

Fill default slots: Registration, AV, Greeters, etc.  
Names can be “TBD” until confirmed — but empty slots show up as warnings.

### Minute 7 — Link the committee (optional)

If a standing committee owns this event, link it.  
Otherwise skip — the event still works standalone.

### Minute 8 — Field log during the week

Use **Live field log** (when county is linked) to record:

- Conversations (HCI)
- New volunteers
- Leader meetings

This feeds volunteer readiness; events feed the Events dimension.

### Minute 9 — After the event

1. Set status → **Executed**
2. Enter **actual attendance**
3. Write **After Action Report** (what worked, what to fix, follow-ups)
4. Set status → **After-action complete**

### Minute 10 — Confirm readiness moved

- Scroll to **Community readiness** → Events dimension should increase.
- Check **KPI dashboard** if your template tracks events held.
- Add **Notebook** entry (meeting notes or lessons learned).

---

## Demo mode tips (training a new operator)

Train on a **pilot workbench** (Sherwood, Jacksonville, or UCA Campus) before your production city:

1. Hub → **10-min field training** toggle for the checklist inline.
2. Hub → **Field QA** to confirm the platform checks pass.
3. Create a clearly labeled test event (`TRAINING — delete me`) and delete when done.

---

## What not to use this for

- County-wide voter analytics → use **County intelligence** (read-only context).
- Executive Book chapter editing → separate route; no rollup from workbench yet.
- Storing sensitive PII in smoke tests → use fake names only in training.

---

## Quick reference

| Task | Section |
|------|---------|
| Assign Community Lead | Leadership |
| Plan event + run-of-show | Events |
| Volunteer roles | Events → Assignments |
| Log doors knocked / volunteers | Field log |
| Post-event learning | Events → AAR + Notebook |
| Find another workbench | Hub filters or Election Plan search |

---

## Production checklist

Before inviting the full local team, complete [`COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md`](./COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md).
