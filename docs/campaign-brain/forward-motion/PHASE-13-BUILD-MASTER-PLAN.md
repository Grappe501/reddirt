# Phase 13 — Forward Motion Build Master Plan

**System:** Forward Motion Activation — announce, promote, and activate upcoming stops before Kelly arrives.  
**Pairing:** Phase 12 (backward proof / motion storytelling) + Phase 13 (forward motion) = perceived statewide momentum.  
**Owner:** Comms + field ops (content & approvals); engineering (build & UI).  
**Hub doc:** [`PHASE-13-FORWARD-MOTION-ACTIVATION-SYSTEM.md`](./PHASE-13-FORWARD-MOTION-ACTIVATION-SYSTEM.md)

## Mission

Every **verified upcoming stop** becomes a full **activation package** — draft/review only until leadership approves public release:

```
Campaign Brain event → Event approval → Mobilize draft → Facebook draft → news release →
graphics brief → phone bank → postcards → (future canvass/door hangers) → Phase 12 story capture
```

## Hard rules (never break)

- No live emails, Facebook posts, Mobilize publish, or press distribution from generated artifacts
- No voter-level PII in docs or UI
- No 20-week calendar lock from this system
- Human approval required before any public release
- Tentative / declined events stay out of the activation queue

## Current state (June 2026)

| Layer | Status | Notes |
| ----- | ------ | ----- |
| Build script | ✅ Done | `npm run campaign-brain:forward-motion` |
| Activation queue JSON | ✅ Done | ~79 stops / 90d horizon |
| Draft docs (news, FB, Mobilize, phone, postcard) | ✅ Scaffolded | Per-stop and template markdown |
| Weekly packet markdown | ✅ Generated | Leadership readout |
| Election plan tab | ⚠️ Summary only | Table + stats; no stop drill-down |
| Event approvals portal | ✅ Done | `/election-plan/event-approvals` |
| Stop drill-down UI | ❌ Not built | No per-event activation page |
| In-app draft links | ❌ Not built | Docs exist on disk only |
| Approval status editing | ❌ Not built | Status lives in build output |
| Phase 12 handoff UI | ❌ Not built | Story capture docs only |
| County / city cross-links | ❌ Not built | Stops not linked to playbooks / city briefs |

---

## Build sub-phases

### Phase 13.0 — Data foundation ✅

**Goal:** Repeatable build from calendar + impact scores.

| Step | Command / artifact |
| ---- | ------------------ |
| Run forward motion build | `npm run campaign-brain:forward-motion` |
| Full brain rebuild | `npm run campaign-brain:build` |
| Election plan snapshot | `npm run election-plan:build` |
| Queue source | `data/campaign-brain/upcoming-stops-activation-queue.json` |
| Summary | `data/campaign-brain/forward-motion-summary.json` |

**Exit criteria:** Queue regenerates without error; election plan Forward Motion tab shows stops.

---

### Phase 13.1 — Calendar Truth gate (in progress)

**Goal:** Only leadership-approved, verified stops flow into activation.

| Step | Work |
| ---- | ---- |
| 1.1 | Declined events (Crawfish, Rodeo, etc.) excluded from queue via event-approvals source |
| 1.2 | `verificationStatus: verified` required before stop enters priority window |
| 1.3 | Reconcile queue `eventId` with campaign calendar record IDs |
| 1.4 | Weekly SOP: approve events in portal → rebuild forward motion |

**Exit criteria:** Queue count matches verified-upcoming calendar rows; no declined events in next-7-day packet.

---

### Phase 13.2 — Stop drill-down UI

**Goal:** Each stop opens a full activation board — not a stats-only row.

| Step | Work |
| ---- | ---- |
| 2.1 | Route: `/election-plan/forward-motion/[eventId]` |
| 2.2 | Panel: event meta, score, county tier, cluster, assignment, readiness % |
| 2.3 | Status grid: Mobilize · Facebook · release · graphic · phone · postcard · story |
| 2.4 | Link from Forward Motion table rows → drill-down |
| 2.5 | Link from event-approvals portal → same drill-down |

**Exit criteria:** Kelly/comms can open any next-7-day stop and see all activation fields + next action.

---

### Phase 13.3 — Draft artifact browser

**Goal:** In-app links to generated markdown drafts (not repo paths only).

| Step | Work |
| ---- | ---- |
| 3.1 | Map `eventId` → news release draft path under `docs/campaign-brain/forward-motion/news-releases/drafts/` |
| 3.2 | Surface Facebook + Mobilize draft queues per stop |
| 3.3 | Graphics request queue: `data/campaign-brain/social-graphics-request-queue.json` |
| 3.4 | Phone bank + postcard assignment queues |
| 3.5 | Optional: render markdown inline for comms review (read-only) |

**Exit criteria:** Every priority-window stop shows clickable draft artifacts or explicit “draft needed.”

---

### Phase 13.4 — Operator approval workflow

**Goal:** Track draft → review → approved without live publishing.

| Step | Work |
| ---- | ---- |
| 4.1 | Source file: `data/campaign-brain/forward-motion-approvals.source.json` (human-edited statuses) |
| 4.2 | Build merge: override generated statuses when leadership marks approved |
| 4.3 | UI badges on stop drill-down (mirror event-approvals pattern) |
| 4.4 | Export JSON for weekly comms handoff |

**Exit criteria:** Comms lead can mark Sherwood July 4 stop “Facebook approved” and rebuild reflects it.

---

### Phase 13.5 — Weekly packet in-app

**Goal:** Replace “open markdown in repo” with operator-facing weekly readout.

| Step | Work |
| ---- | ---- |
| 5.1 | Parse or snapshot `weekly-forward-motion-packet.md` into election plan JSON |
| 5.2 | UI: Kelly / surrogate / county team sections for next 7 days |
| 5.3 | “Missing promotion pieces” as actionable checklist |
| 5.4 | War room rollup: next-week readiness % |

**Exit criteria:** Monday stand-up uses election plan packet only — no git required.

---

### Phase 13.6 — Phase 12 handoff (story capture)

**Goal:** Pre-stop brief connects to post-stop motion proof.

| Step | Work |
| ---- | ---- |
| 6.1 | Link stop drill-down → `story-capture/` brief for that event |
| 6.2 | After event date passes, prompt “Move to Phase 12 story pipeline” |
| 6.3 | Cross-link Social Resume / Presence Map tabs |

**Exit criteria:** Completed stop shows story workflow status and link to Phase 12 capture template.

---

### Phase 13.7 — Geography binding

**Goal:** Forward motion stops connect to county playbooks and city location briefs.

| Step | Work |
| ---- | ---- |
| 7.1 | County link → county playbook (leader workbench) |
| 7.2 | City link → `/election-plan/cities/[slug]` when city in Top 40 |
| 7.3 | Show county registration goal + coverage on stop page |

**Exit criteria:** Opening “Rogers Rodeo” stop links to Benton/Washington county playbook and relevant city brief.

---

### Phase 13.8 — Canvass & door hangers (future field layer)

**Goal:** Prep checklists ready; activation when turf program launches.

| Step | Work |
| ---- | ---- |
| 8.1 | Keep canvass/door status default `future` until Phase 10 field OS ready |
| 8.2 | Turf assignment hook from county workbench (when available) |
| 8.3 | Door hanger print brief per high-score rural stop |

**Exit criteria:** Status stays honest (“future”); no fake completed canvass rows.

---

### Phase 13.9 — Production cadence & definition of done

**Goal:** Phase 13 runs weekly without engineering.

| Step | Work |
| ---- | ---- |
| 9.1 | Weekly rebuild checklist for field + comms |
| 9.2 | `missingPieces` drives Monday priorities (already in snapshot) |
| 9.3 | Average activation readiness ≥ 60% for next-7-day Kelly stops |
| 9.4 | Document in war room + Forward Motion tab |

**Weekly operator sequence:**

1. Update event-approvals decisions (`event-approvals.source.json`)
2. Verify new calendar dates in campaign brain ingest
3. `npm run campaign-brain:forward-motion`
4. `npm run election-plan:build`
5. Review weekly packet + approve drafts for next 7 days
6. Hand approved Mobilize/FB copy to publishing owner (human, outside system)

---

## Twelve objectives → build mapping

| # | Objective | Build phase | Primary artifact |
| - | --------- | ----------- | ---------------- |
| 1 | Forward Motion Hub | 13.0 ✅ | `PHASE-13-FORWARD-MOTION-ACTIVATION-SYSTEM.md` |
| 2 | Activation Queue | 13.0 ✅ | `upcoming-stops-activation-queue.json` |
| 3 | Weekly Packet | 13.5 | `weekly-forward-motion-packet.md` |
| 4 | News Releases | 13.3 | `news-releases/drafts/` |
| 5 | Social Graphics | 13.3 | `social-graphics-request-queue.json` |
| 6 | Facebook Drafts | 13.3–13.4 | `facebook-events/` |
| 7 | Mobilize Drafts | 13.3–13.4 | `mobilize/` |
| 8 | Phone Banks | 13.3 | `phone-bank-invitations/` |
| 9 | Postcards | 13.3 | `postcards/` |
| 10 | Canvass / Door Hangers | 13.8 | `canvass-door-hangers/` (future) |
| 11 | Story Capture | 13.6 | `story-capture/` |
| 12 | Election Plan UI | 13.2–13.5 | `/election-plan?tab=forwardMotion` |

---

## Suggested build order (engineering)

1. **13.2** Stop drill-down (unblocks everything else)
2. **13.1** Calendar Truth gate (data quality)
3. **13.3** Draft artifact links
4. **13.4** Approval workflow source
5. **13.5** Weekly packet UI
6. **13.7** County/city binding
7. **13.6** Phase 12 handoff
8. **13.8** Canvass layer (when field ready)
9. **13.9** Cadence doc + war room polish

---

## Definition of done (Phase 13 complete)

- [ ] All next-7-day Kelly stops have drill-down pages with linked drafts
- [ ] Event approvals ↔ activation queue stay in sync after weekly rebuild
- [ ] Comms can mark activation statuses approved in source JSON
- [ ] Weekly packet readable in election plan without opening repo
- [ ] County playbook + city brief links on every stop
- [ ] Phase 12 story capture linked for post-event workflow
- [ ] No live auto-publishing; all public release remains human-gated

---

## Commands reference

```bash
# Regenerate Phase 13 artifacts
npm run campaign-brain:forward-motion

# Full campaign brain (includes forward motion)
npm run campaign-brain:build

# Refresh election plan / war room snapshot
npm run election-plan:build

# Typecheck after UI changes
npm run typecheck
```

---

## Related systems

| System | Relationship |
| ------ | ------------- |
| Phase 12 Motion & Storytelling | Post-event proof; story pipeline after stop completes |
| Event approvals portal | Upstream gate — Kelly attend / decline / verify |
| Calendar Truth | Verified dates required before activation |
| Phase 14 Coalition Power Map | Shared events · forums · surrogate scheduling |
| City location briefs | Messaging context for stop’s city |
| County playbooks | Field goals, leaders, calendar for stop’s county |
