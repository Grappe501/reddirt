# Leadership Directive — 30 Days

> **Campaign Phase · June 2026**  
> For Kelly and senior staff

---

## Standing order

For the next 30 days:

- **Do not** build new models
- **Do not** build new dashboards
- **Do not** build new scoring systems
- **Do not** build new strategic frameworks

Software architecture is frozen. Campaign discipline is not.

---

## Instead: four verbs

### 1. Verify

Staff the Verification War Room:

| Team | Scope |
| ---- | ----- |
| A | County fairs (75) |
| B | Festivals |
| C | Faith events |
| D | Clerk events |

Also verify chamber events as capacity allows.

Checklists: [operations/war-room/](../operations/war-room/)

Log to: [`event-verification-overrides.json`](../../data/campaign-brain/event-verification-overrides.json)

---

### 2. Assign

| Assignment | File |
| ---------- | ---- |
| County contact owners (75) | [`county-contact-owners.json`](../../data/campaign-brain/county-contact-owners.json) |
| Verification owners (Teams A–D) | War room leads |
| Cluster owners (9) | Campaign ops |

Every county must have a named owner before Phase 9.

---

### 3. Capture

After every event, log:

- Attendance · contacts · registrations · volunteer signups
- Faith relationships · clerk relationships
- **Relationship assets** — signs · shirts · house parties · postcards · phone calls · doors

Files:

- [`event-outcomes.json`](../../data/campaign-brain/event-outcomes.json)
- [`county-visit-log.json`](../../data/campaign-brain/county-visit-log.json)
- [`captured-progress.json`](../../data/campaign-brain/captured-progress.json)
- [`relationship-assets.json`](../../data/campaign-brain/relationship-assets.json) — [Relational Organizing Engine](../relational-organizing/OPERATING-DOCTRINE.md)

---

### 4. Report · Review

| When | Action |
| ---- | ------ |
| **Every Friday** | Field teams submit outcomes · verification updates · visit logs |
| **Every Friday EOD** | `npm run campaign-brain:build` |
| **Every Monday** | [Monday Leadership Rhythm](./MONDAY-LEADERSHIP-RHYTHM.md) — seven artifacts, three decisions |

---

## Monday questions (non-negotiable)

1. What did we learn?
2. What changed?
3. What are the three most important deployments this week?

Use the Brain to **focus** discussion — not generate more reports.

---

## Phase 9 authorization

Leadership may authorize the **Locked 20-Week Campaign Calendar** only when [exit criteria](./brain-health-dashboard.md#operation-calendar-truth--exit-criteria) are met.

Until then: week candidates are proposals, not locked schedules.

---

## The single evaluation question

Before any new work — software or field:

> **Does this improve the quality of verified inputs flowing into the Brain?**

If no → defer.

---

*Status report:* [CAMPAIGN-BRAIN-STATUS-REPORT-JUNE-2026.md](./CAMPAIGN-BRAIN-STATUS-REPORT-JUNE-2026.md)
