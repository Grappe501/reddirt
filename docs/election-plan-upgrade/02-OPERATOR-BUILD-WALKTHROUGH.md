# 02 — Operator build walkthrough

**Purpose:** Session script for campaign leadership to review and approve the Election Plan upgrade with Steve (operator). One session = one checklist block. Do not skip the pilot doorway.

---

## Session 0 — Sandbox verification (15 min)

**Steve runs:**

```bash
cd H:/SOSWebsite/RedDirt
node scripts/run-with-h-drive-env.cjs npm run election-plan:audit:routes
```

**Kelly / leadership opens:**

- `/election-plan` → Executive War Room
- `/election-plan/executive-book` → share one chapter URL
- `/admin/election-plan` → smoke-test doorway

**Approve when:** Route audit prints `909 / 909 resolved`. Donate gate shows **Continue to website** at readable size.

---

## Session 1 — Pilot doorway (45 min)

**Start at:** `/admin/election-plan` → Smoke test doorway

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/election-plan/counties/faulkner` | County intel v3 + ops v4 panels visible |
| 2 | `/election-plan/workbenches/jacksonville` | Leadership tab; create PILOT event path documented |
| 3 | `/election-plan/workbenches/sherwood#events` | Events list; city ≠ event leadership labeled |
| 4 | `/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings` | Sept 17 · $20K profit · Event Chair slot empty is OK but noted |

**Assign in UI:**

- Jacksonville: Community Lead (test name only in staging)
- G&G: Event Chair (distinct from Sherwood city lead)

**Run smoke:**

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-smoke
```

**Gate:** Primary paths PASS before Session 3 enrollment talk.

---

## Session 2 — Executive Book live review (60 min)

Use `docs/campaign-brain/review/CANDIDATE-REVIEW-HARDENING-CHECKLIST.md`.

**Read order:**

1. `/election-plan/executive-book/doctrine` (Ch. 0)
2. `/election-plan/executive-book/county-victory-targets`
3. `/election-plan/executive-book/budget`
4. `/election-plan/executive-book/power-of-5`

**For each chapter capture:**

- [ ] Contrast readable on laptop + phone
- [ ] “Planning targets only” disclaimer where required
- [ ] Ownership matrix shows assign owner for TBD rows
- [ ] Related chapter links work

**Assign:** 4 operational owners from completion audit (GOTV war room lead first).

---

## Session 3 — Page tier leveling (90 min)

Open [03-PAGE-TIER-MATRIX.md](./03-PAGE-TIER-MATRIX.md).

**Batch A — Leadership cluster**

- `/election-plan/leadership`
- `/election-plan/leadership/weekly-packet`
- `/election-plan/leadership/responsibility-matrix`
- `/election-plan/leadership/county-coverage`

**Batch B — Field + calendar**

- `/election-plan/field-calendar/operations`
- `/election-plan/battlefield`
- `/election-plan/lanes-overview`

**Batch C — Volunteer pipeline**

- `/election-plan/academy`
- `/election-plan/academy/power-of-5-leader`
- `/election-plan/power-of-5/command-center`

For each **Tier B** page, operator marks:

- Missing page brief? → add to `page-briefs.source.json`
- Missing related links? → add 3 minimum
- Thin prose? → flag for Campaign Brain pass

---

## Session 4 — County + city sweep (2 hr, can split)

**Sample 5 counties:** Faulkner (gold), Pulaski, Washington, Craighead, Union (thin).

**Sample 5 cities:** Jacksonville, Sherwood, Conway, Fayetteville, Hot Springs.

**Checklist per page:**

- [ ] Playbook metrics load from snapshot
- [ ] Link to county party intel if available
- [ ] Workbench link if municipal pilot
- [ ] No dark-on-dark text in guardrail banners

---

## Session 5 — Public site + fundraising entry (30 min)

**Homepage:** Open donate floating gate → **Continue to website** → full site navigation.

**Confirm:** No placeholder persona names in Election Plan UI copy.

---

## Session 6 — Upgrade sign-off

Review [01-UPGRADE-RECOMMENDATION.md](./01-UPGRADE-RECOMMENDATION.md).

**Decision table:**

| Question | Yes / No / Defer |
|----------|------------------|
| Proceed Phase 1 page briefs for all routes? | |
| Proceed Phase 2 county intel template rollout? | |
| Block coalition enrollment until PPEN A.0b? | |
| Schedule compliance route rename (Phase 4)? | |
| Add route audit to Netlify build? | |

**Output:** Tick items in Phase plan; engineering picks next PR from Phase 1 backlog.

---

## Appendix — commands after content edits

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:build
node scripts/run-with-h-drive-env.cjs npm run election-plan:search:build
node scripts/run-with-h-drive-env.cjs npm run campaign-brain:executive-book:completion
node scripts/run-with-h-drive-env.cjs npm run election-plan:audit:routes
```

Commit message pattern: `election-plan: <phase> — <short why>`
