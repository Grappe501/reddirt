# CPOS Design Pass 02 — Information Architecture

**Date:** 2026-06-28  
**Target:** Kelly kickoff **tonight** — vertical slice IA before implementation  
**Decisions:** Locked per Steve/Ernie packet (see §1)  
**Manifest:** [`data/cpos/manifests/kickoff-2026.yaml`](../../data/cpos/manifests/kickoff-2026.yaml)  
**Spec:** [`021-MEETING-MANIFEST-SPEC.md`](./021-MEETING-MANIFEST-SPEC.md)  
**Traceability:** [`030-MASTER-TRACEABILITY-MATRIX.md`](./030-MASTER-TRACEABILITY-MATRIX.md)

---

## 1. Locked decisions (Pass 01 → Pass 02)

| ID | Decision |
|----|----------|
| D1 | **Alongside Zoom** — audio/video on Zoom; CPOS = guided OS + audience companion + demos + timing |
| D2 | **Election Plan login first** (`/election-plan/login`); passcode fallback if friction; unlisted emergency only |
| D3 | **Polling-only v1** — abstract `SessionSyncTransport` so Supabase Realtime can replace later |
| D4 | **Primary demo:** `/election-plan/counties` (hub — **new route** in CPOS-6); secondary demo cards only |
| D5 | **Mobile-first audience**; desktop-first presenter console |
| D6 | **Division 12** registered — staged/spec-first |
| D7 | **Kickoff:** 2026-06-28, 5:59–6:59 PM Central; program 6:13 PM |
| D8 | **Analytics-only** — no replay video; library keeps manifest + session metadata |

**Join slug:** `team-kickoff` — shortest practical path under Election Plan auth.

**Opening banner copy (manifest `join.bannerCopy`):**

> Follow along on your phone, tablet, or computer at `/election-plan/team-kickoff` — same screen as Zoom or at home.

---

## 2. Route map

### 2.1 Audience + presenter (v1 minimum)

| Route | Surface | Auth | Layout |
|-------|---------|------|--------|
| `/election-plan/team-kickoff` | Audience meeting view | EP login required | `CposKickoffLayout` — **no** portal header chrome |
| `/election-plan/team-kickoff/presenter` | Presenter console | EP login + presenter gate | `CposPresenterLayout` |
| `/election-plan/team-kickoff/manifest` | Dev read-only manifest | EP login | Plain pre |

**Auth implementation:** Wrap kickoff layout with same check as portal — `requireElectionPlanPortalAccess()` redirects to `/election-plan/login?next=…` when `ELECTION_PLAN_PASSWORD` set.

**Presenter gate:** Env `CPOS_PRESENTER_TOKEN` or operator initials allowlist — CPOS-4 slice. Tonight fallback: same EP password + `?presenter=1` hidden path with env token in presenter URL query (document in runbook).

### 2.2 Presentation-mode Election Plan

| Route | Role | Notes |
|-------|------|-------|
| `/election-plan/counties` | **Primary demo** | **Create** counties hub index (CPOS-6) — today may not exist |
| `/election-plan/counties?presentation=true&cpos=1` | Polished presentation view | Strip nav; soft return bar |
| `/election-plan/battlefield?presentation=true&cpos=1` | Secondary card — immersion |
| `/election-plan/operators/events-command?presentation=true&cpos=1` | Secondary card — calendar |
| `/admin/election-plan?presentation=true&cpos=1` | Secondary card — staff only |

### 2.3 API routes (polling v1)

| Route | Method | Role |
|-------|--------|------|
| `/api/cpos/session/[meetingId]` | GET | Audience + presenter poll session state |
| `/api/cpos/session/[meetingId]` | POST | Presenter advance chapter / launch demo (auth) |
| `/api/cpos/session/[meetingId]/responses` | POST | Audience poll submit |
| `/api/cpos/session/[meetingId]/analytics` | GET | Operator export (post-meeting) |

`meetingId` for kickoff: `kickoff-2026` (manifest `id`, not slug).

**Poll interval:** 2s audience, 1s presenter (configurable `CPOS_POLL_MS`).

### 2.4 Existing auth routes (reuse)

| Route | Use |
|-------|-----|
| `/election-plan/login` | Pre-kickoff login |
| `/election-plan/login?next=/election-plan/team-kickoff` | Direct join deep link |

---

## 3. File map (proposed — created in build slices)

```
RedDirt/
├── data/cpos/
│   ├── manifests/
│   │   └── kickoff-2026.yaml          ✅ seed (Pass 02)
│   └── sessions/                       # optional JSON session logs post-meeting
│       └── kickoff-2026-20260628.json
├── docs/cpos/                          ✅ spec tree
├── src/lib/cpos/
│   ├── README.md
│   ├── load-meeting-manifest.ts
│   ├── compile-manifest.ts
│   ├── meeting-engine.ts
│   ├── timeline-engine.ts
│   ├── chapter-engine.ts
│   ├── session-store.ts                # in-memory + file persist
│   ├── session-sync/
│   │   ├── transport.ts                # SessionSyncTransport interface
│   │   └── polling-transport.ts        # v1
│   ├── presentation-query.ts           # build ?presentation URLs
│   ├── analytics/
│   │   └── meeting-events.ts
│   └── schemas/
│       └── meeting-manifest.ts         # Zod — CPOS-1
├── src/components/cpos/
│   ├── audience/
│   │   ├── CposAudienceShell.tsx
│   │   ├── CposOpeningBanner.tsx       # join URL + banner copy
│   │   ├── CposChapterRenderer.tsx
│   │   ├── segments/
│   │   │   ├── CposVideoSegment.tsx
│   │   │   ├── CposNarrativeSegment.tsx
│   │   │   ├── CposMetricAnimationSegment.tsx
│   │   │   ├── CposGoldenCircleSegment.tsx
│   │   │   ├── CposDemoLauncherSegment.tsx
│   │   │   └── CposInteractionStackSegment.tsx
│   │   ├── CposPollCard.tsx
│   │   └── CposSoftReturnBar.tsx
│   ├── presenter/
│   │   ├── CposPresenterShell.tsx
│   │   ├── CposPresenterClock.tsx
│   │   ├── CposCuePanel.tsx
│   │   ├── CposChapterControls.tsx
│   │   ├── CposDemoButtons.tsx
│   │   └── CposTimingWarnings.tsx
│   └── shared/
│       ├── CposPresentationModeGate.tsx
│       └── useCposSessionPoll.ts
└── src/app/
    ├── election-plan/
    │   ├── team-kickoff/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── presenter/page.tsx
    │   │   └── manifest/page.tsx
    │   └── (portal)/
    │       └── counties/
    │           └── page.tsx            # NEW hub — CPOS-6
    └── api/cpos/session/[meetingId]/
        ├── route.ts
        └── responses/route.ts
```

---

## 4. Component map

### 4.1 Audience shell (`mobile-first`)

```
CposAudienceShell
├── CposOpeningBanner          join URL, subtitle, disclaimer (ch00–ch01)
├── CposChapterHeader          title + story beat label
├── CposChapterRenderer        picks segment components
├── CposSoftReturnBar          when activeDemo set — "Return to meeting"
└── CposSessionFooter          chapter progress dots (Netflix-style)
```

### 4.2 Presenter shell (`desktop-first`)

```
CposPresenterShell
├── CposPresenterClock         wall clock + program elapsed + chapter target
├── CposChapterControls        prev / next / jump list
├── CposCuePanel               active cues for current chapter
├── CposPresenterNotes         markdown from manifest (future doc 026)
├── CposDemoButtons            primary + secondary cards
├── CposTimingWarnings         amber when chapter overrun
└── CposAudienceStatus         polling estimate / "sync via polling"
```

### 4.3 Presentation mode wrapper (Election Plan)

```
CposPresentationModeGate       reads ?presentation=true&cpos=1
├── hides ElectionPlanPortalHeader, operator bars
├── injects CposSoftReturnBar if meetingSession query present
└── applies ep-presentation CSS token overrides
```

---

## 5. Data structures

### 5.1 `MeetingSession` (runtime)

```typescript
interface MeetingSession {
  meetingId: string;              // kickoff-2026
  manifestVersion: number;
  status: "lobby" | "live" | "paused" | "ended";
  currentChapterId: string;
  activeDemoId: string | null;
  activeInteractionId: string | null;
  presenterChapterIndex: number;
  startedAt: string;              // ISO
  programStartedAt: string | null;
  updatedAt: string;
  transport: "polling";
}
```

### 5.2 `AudienceResponse`

```typescript
interface AudienceResponse {
  id: string;
  meetingId: string;
  chapterId: string;
  interactionId: string;
  optionId?: string;
  participantKey: string;         // cookie anon id or user id
  submittedAt: string;
  metadata?: {
    electionPlanOperatorInitials?: string;
  };
}
```

### 5.3 `MeetingAnalyticsEvent`

```typescript
interface MeetingAnalyticsEvent {
  type:
    | "session.start"
    | "session.end"
    | "chapter.enter"
    | "chapter.exit"
    | "demo.open"
    | "demo.return"
    | "interaction.submit"
    | "audience.join"
    | "audience.leave";
  meetingId: string;
  chapterId?: string;
  demoId?: string;
  interactionId?: string;
  at: string;
  participantKey?: string;
}
```

### 5.4 `SoftNavigationPrompt`

```typescript
interface SoftNavigationPrompt {
  demoId: string;
  label: string;                  // "County Playbooks"
  returnPath: string;             // /election-plan/team-kickoff
  openedAt: string;
  autoReturnOnChapterChange: boolean;
}
```

### 5.5 Zod schema map

| Schema file | Objects |
|-------------|---------|
| `meeting-manifest.ts` | MeetingManifest, Chapter, Segment, DemoLink, Interaction, Cue, MetricBeat, … |
| `meeting-session.ts` | MeetingSession, SoftNavigationPrompt |
| `audience-response.ts` | AudienceResponse |
| `analytics-event.ts` | MeetingAnalyticsEvent |

Full field lists mirror [`021-MEETING-MANIFEST-SPEC.md`](./021-MEETING-MANIFEST-SPEC.md).

---

## 6. Session sync abstraction (D3)

```typescript
interface SessionSyncTransport {
  getSession(meetingId: string): Promise<MeetingSession>;
  publishSession(session: MeetingSession): Promise<void>;
  subscribe(
    meetingId: string,
    onUpdate: (s: MeetingSession) => void,
  ): () => void;
}

// v1: PollingTransport — client polls GET /api/cpos/session/[id]
// future: SupabaseRealtimeTransport — same interface, channel per meetingId
```

**Rule:** No story/demo component imports transport directly — use `useCposSessionPoll` hook.

---

## 7. Chapter → UI mapping (kickoff)

| Chapter id | Primary segment components | Interactions | Demos |
|------------|---------------------------|--------------|-------|
| ch00_opening_video | CposVideoSegment | — | — |
| ch01_welcome | Narrative, LoginReminder, Countdown | — | — |
| ch02_why | Narrative | — | — |
| ch03_road_since_november | MetricAnimation, Narrative | — | — |
| ch04_golden_circle | GoldenCircle | — | — |
| ch05_bigger_than_one | Narrative | — | — |
| ch06_immersion_house_party | Narrative | — | — |
| ch07_power_of_5 | Narrative | — | — |
| ch08_voter_registration | MetricStrip, Narrative | — | — |
| ch09_social_media | Narrative, Hashtag | — | — |
| ch10_dashboard_tour | DemoLauncher, DemoCards | — | county_playbook_hub + cards |
| ch11_choose_lane | InteractionStack, ClosingLine | 3 polls | — |

---

## 8. v1 feature checklist (tonight vertical slice)

| Feature | Slice | Tonight minimum |
|---------|-------|-----------------|
| Manifest-driven chapters | CPOS-1,3 | Load yaml + render narrative chapters |
| Opening video placeholder | CPOS-3 | Poster + "video at 5:59" if file missing |
| Wall-clock timing | CPOS-2,4 | Clock display; manual advance OK |
| Presenter notes | CPOS-4 | Cues panel from manifest |
| Audience chapter view | CPOS-3 | Mobile shell + banner with join URL |
| Soft demo prompts | CPOS-7 | Return bar + demo launch |
| Counties presentation hub | CPOS-6 | List counties or battlefield fallback |
| Poll capture | CPOS-8 | Store responses; export JSON |
| `/api/forms` routing | CPOS-9 | **Stretch tonight** — polls sufficient for v0 |
| Analytics events | CPOS-8 | Log to session file |
| No replay | — | ✅ |
| No Zoom replacement | — | ✅ |
| No hard nav lock | — | ✅ |

**Tonight realistic path:** CPOS-1 → 2 → 3 → 4 with manual presenter advance; ch01 banner + ch02–09 narrative; ch10 stub demo card; ch11 poll UI local-only until CPOS-8.

---

## 9. Integration points

| System | Integration | Packet |
|--------|-------------|--------|
| Election Plan auth | `portal-access.ts` | CPOS-3 layout |
| `/api/forms` | `formKey: volunteer_kickoff_lane_selection` | CPOS-9 |
| WorkflowIntake | `workflowIntakeType: volunteer_kickoff` | CPOS-9 |
| VolunteerProfile hints | `metadataJson.cpos` namespace | CPOS-9+ |
| Truth snapshot | optional live metric override | CPOS-10+ |

**No new intake table.**

---

## 10. CSS / layout tokens

- Reuse `election-plan.css` variables (`--ep-navy`, etc.).
- New namespace: `.cpos-*` in `src/app/election-plan/cpos-kickoff.css`.
- Mobile: min tap target 44px; poll chips full-width stack.
- Presenter: min width 1024px recommended; collapsible cue panel.

---

## 11. Operator runbook (kickoff night)

1. Set `ELECTION_PLAN_PASSWORD` on Netlify/host.
2. Share Zoom link + **`https://{host}/election-plan/team-kickoff`** in chat at 5:55 PM.
3. Volunteers login at `/election-plan/login` if not sessioned.
4. Presenter opens `/election-plan/team-kickoff/presenter` on second screen.
5. Advance chapters manually if auto wall-clock not ready.
6. Post-meeting: download analytics from `/api/cpos/session/kickoff-2026/analytics`.
7. Optional: enable post-meeting passcode on EP password rotation.

---

## 12. Pass 02 completion

| Deliverable | Status |
|-------------|--------|
| Route map | ✅ §2 |
| File map | ✅ §3 |
| Component map | ✅ §4 |
| JSON/Zod schema map | ✅ §5 + 021 |
| Manifest spec | ✅ 021 |
| Kickoff manifest seed | ✅ yaml |
| Traceability matrix | ✅ 030 |
| Division 12 registry | ✅ registry update |
| Locked decisions | ✅ §1 |

**Next:** CPOS-1 implementation slice (manifest validator + types) unless Steve steers UX Bible pass first for motion tokens.
