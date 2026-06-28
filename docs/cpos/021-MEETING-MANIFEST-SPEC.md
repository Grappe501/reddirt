# 021 — Meeting Manifest Specification

**Doc ID:** CPOS-021  
**Status:** Normative for CPOS-1+  
**Seed manifest:** [`../../data/cpos/manifests/kickoff-2026.yaml`](../../data/cpos/manifests/kickoff-2026.yaml)

---

## 1. Format

| Authoring | Runtime |
|-----------|---------|
| YAML in `data/cpos/manifests/*.yaml` | JSON after compile |
| Validated by Zod (`src/lib/cpos/schemas/meeting-manifest.ts` in CPOS-1) | Loaded by Meeting Engine |

**CLI (CPOS-1):** `npm run cpos:validate-manifest -- kickoff-2026`

---

## 2. Root object: `MeetingManifest`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable id e.g. `kickoff-2026` |
| `slug` | string | yes | URL slug e.g. `team-kickoff` → `/election-plan/team-kickoff` |
| `version` | integer | yes | Bump on material manifest change |
| `meetingType` | enum | yes | `team_kickoff`, `county_monthly`, `training`, … |
| `title` | string | yes | Display title |
| `subtitle` | string | no | |
| `schedule` | `MeetingSchedule` | yes | Wall-clock anchors |
| `join` | `JoinConfig` | yes | Paths + banner copy |
| `promise` | string | no | Primary meeting promise |
| `openingDisclaimer` | string | no | Guided tour disclaimer |
| `coreNumbers` | `MetricBeat[]` | no | Static campaign numbers |
| `media` | `MediaBundle` | no | Packaged video refs |
| `chapters` | `Chapter[]` | yes | Ordered spine |
| `demos` | Record&lt;id, DemoLink&gt; | no | Demo catalog |
| `interactions` | Record&lt;id, Interaction&gt; | no | Poll / form defs |
| `cues` | Record&lt;id, Cue&gt; | no | Presenter-only |
| `timing` | `TimingConfig` | no | |
| `completion` | `CompletionConfig` | no | |
| `integrations` | `IntegrationFlags` | no | |

---

## 3. `MeetingSchedule`

```typescript
{
  timezone: string;           // IANA e.g. America/Chicago
  meetingStart: string;       // ISO 8601 local or UTC — compile normalizes
  meetingEnd: string;
  programStart: string;       // When guided program begins (after buffer)
}
```

---

## 4. `JoinConfig`

```typescript
{
  audiencePath: string;       // /election-plan/team-kickoff
  presenterPath: string;      // /election-plan/team-kickoff/presenter
  bannerCopy: string;         // Shown on opening banner + ch01
  authPolicy: "election_plan_login" | "passcode" | "unlisted";
  postMeetingPasscode?: boolean; // Steer: tighten after meeting
}
```

**v1 kickoff:** `election_plan_login` — reuse `/election-plan/login` session cookie (`ELECTION_PLAN_SESSION_COOKIE`).

---

## 5. `MetricBeat`

```typescript
{
  key: string;                // stable key for animation + live override
  label: string;
  value: string;              // display string — "20,000+", "Thousands"
  unit?: string;
  liveSource?: "truth_snapshot" | "election_plan" | null;
}
```

---

## 6. `Chapter`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Stable e.g. `ch03_road_since_november` |
| `index` | number | 0-based order |
| `title` | string | |
| `scheduleStart` / `scheduleEnd` | ISO string | Wall-clock for Timeline Engine |
| `storyBeat` | string | Story Engine tag |
| `audienceMode` | enum? | `full_screen_video`, `standard`, … |
| `presenterAction` | enum? | `none`, `advance_manual`, … |
| `segments` | `Segment[]` | Render units |
| `cues` | string[]? | Cue ids active in chapter |
| `primaryDemo` | string? | Demo id |
| `secondaryDemoCards` | string[]? | Card-only demos |
| `interactions` | string[]? | Interaction ids |
| `closingLine` | string? | |

---

## 7. `Segment` (discriminated union)

| `type` | Payload |
|--------|---------|
| `video` | `mediaRef` |
| `narrative` | `body` (markdown-lite) |
| `login_reminder` | — |
| `countdown` | `label` |
| `metric_animation` | `metrics: string[]` (keys) |
| `metric_strip` | `metrics: string[]` |
| `golden_circle` | `why`, `how`, `what` |
| `hashtag` | `tag` |
| `demo_launcher` | `demoRef` |
| `demo_cards` | `softMode: boolean` |
| `interaction_stack` | — |
| `closing_line` | uses chapter `closingLine` |

---

## 8. `DemoLink`

```typescript
{
  id: string;
  label: string;
  path: string;
  presentationQuery?: Record<string, string>;
  polishLevel: "v1_primary" | "card_only" | "placeholder";
}
```

**Presentation URL builder:**

```
{path}?presentation=true&cpos=1&meetingSession={sessionId}&returnTo=/election-plan/team-kickoff
```

---

## 9. `Interaction`

```typescript
{
  id: string;
  type: "poll" | "form" | "button";
  prompt?: string;
  options?: PollOption[];
  formKey?: string;           // routes to /api/forms in completion
}
```

**PollOption:** `{ id: string; label: string }`

**v1 persistence:** session file or lightweight table — aggregate analytics; identified users merge on EP login. Lane selections **also** spec'd for `/api/forms` in CPOS-9 (not duplicate intake).

---

## 10. `Cue`

```typescript
{
  text: string;
  chapters: string[];         // chapter ids where cue may surface
  scheduleHint?: string;      // optional ISO — future timed cues
}
```

Presenter Console only — never rendered on Audience View.

---

## 11. `TimingConfig`

```typescript
{
  useWallClock: boolean;
  chapterWarningsMinutesBeforeEnd?: number;
  globalHardStopMinutes?: number;
}
```

---

## 12. `CompletionConfig`

```typescript
{
  analyticsOnly?: boolean;
  replayVideo?: boolean;      // v1: false
  formRouting?: {
    provider: "api_forms";
    path: "/api/forms";
    formKey: string;
    workflowIntakeType: string;
  };
}
```

---

## 13. Validation rules

1. `chapters[].index` unique and contiguous 0..n-1.
2. Every `cue.chapters[]` ref exists in `chapters[].id`.
3. Every `chapter.interactions[]` ref exists in `interactions`.
4. Every `demoRef` exists in `demos`.
5. `schedule.programStart` >= `schedule.meetingStart`.
6. `slug` matches `^[a-z0-9-]+$` — short, memorable (`team-kickoff`).
7. No secret values in manifest files.

---

## 14. Meeting instance vs manifest

| Object | Storage | Lifetime |
|--------|---------|----------|
| `MeetingManifest` | `data/cpos/manifests/` | Permanent library |
| `MeetingSession` | server memory + optional JSON under `data/cpos/sessions/` | One live event |
| `AudienceResponse` | session store + analytics export | Per poll submit |

`MeetingSession` fields — see [`CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md`](./CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md) § Session state.
