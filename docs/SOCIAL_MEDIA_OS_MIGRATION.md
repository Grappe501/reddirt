# Social Media Command → SMOS Migration

**Status:** Structural doctrine · **Lane:** `RedDirt/` · **Audience:** Burt, comms leads, volunteer creators  
**Updated:** 2026-06-16  
**Related:** [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md), [`COALITION_COMMAND_WORKBENCH_MIGRATION.md`](./COALITION_COMMAND_WORKBENCH_MIGRATION.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md)

---

## Problem

**Social Media Command** (formerly “Social Resume”) was a war-room dashboard:

```text
Social Media Resume
├── Counties highlighted (snapshot zero)
├── Stories published
├── Story categories (count / goal progress bars)
└── Motion-presence KPI grid
```

Same mistake as Coalition Command: **cards and KPIs**, not an operating system. Numbers without openable content records violate [data integrity doctrine](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md).

---

## Target architecture

Social Media Command becomes a **hub** into first-class **SMOS workbenches** — same Community Workbench engine as Sherwood and coalition workbenches:

```text
Social Media Command (hub)
├── Content Studio
├── Media Command Center
├── Story Corps
├── Rapid Response
├── Volunteer Creator Network
├── Publishing Engine
├── Analytics
├── Writing Workbenches (8)
├── Platform Workbenches (Facebook, Instagram, TikTok, YouTube, Threads, Email, Website)
└── Production (Video Studio, Photography Library)
```

Registry: `data/campaign-brain/social-media-workbenches.registry.source.json`  
Prisma kind: `CommunityWorkbenchKind.media`

---

## Four operating systems (campaign backbone)

```text
Community Workbench OS   → people & field operations
PPEN                     → growth & participation
Social Media OS (SMOS)   → content & narrative operations
Campaign Communications Hub (CCH) → Kelly's voice · Substack source of truth · distribution
```

See [`CAMPAIGN_COMMUNICATIONS_HUB_DOCTRINE.md`](./CAMPAIGN_COMMUNICATIONS_HUB_DOCTRINE.md). CCH owns the canonical Substack post; SMOS owns platform adaptations and publish queue.

---

## Three operating systems (legacy summary — now four)

```text
Community Workbench OS   → people & field operations
PPEN                     → growth & participation
Social Media OS (SMOS)   → content & narrative operations
```

County intelligence, coalition intelligence, and executive strategy **feed into** these systems — they are not separate destinations.

---

## Phase 1 vs Phase 2

| Phase | Scope |
|-------|--------|
| **Phase 1 (now)** | Workbench structure, pipeline statuses, assignment roles, approval chain, publish queue, record-backed counts |
| **Phase 2 (later)** | Facebook / Instagram / YouTube / TikTok API integration — after content ops are stable |

Content operations matter more than publishing automation.

---

## Workbench categories

| Category | Examples |
|----------|----------|
| **core** | Content Studio, Media Library, Story Corps, Rapid Response, Creator Network, Publishing, Analytics |
| **writing** | Press releases, Facebook posts, email, debate prep, speeches, video scripts, LTE, opinion |
| **platform** | Per-platform strategy, queue, performance — not tabs on a dashboard |
| **production** | Video Studio, Photography Library |

Each workbench inherits the standard shell:

```text
Overview · Leadership · Events · Committees · Relationships
Record counts · Community goals (planning) · Field log · Intel · Notes
+ SMOS framework sections (pipeline, assignments, media taxonomy, approval chain)
```

---

## Story Corps integration (Phase 2+)

City, coalition, and field workbenches submit:

```text
Story · Photo · Video · Quote · Issue
```

Each submission is a **record** with `sourceWorkbenchSlug` → feeds **Story Corps Workbench** for production.

---

## Volunteer Creator Network

PPEN meets media. Creator records track:

```text
Training · Assignments · Uploads · Performance
```

Roles: county creator, photographer, video creator, graphic designer, writer, podcast contributor.

---

## Approval pipeline

```text
Creator → Editor → Approver → Publisher
```

Required once multiple volunteers contribute. Phase 1: manual queue; Phase 2: optional platform auto-publish after approval.

---

## What changed in code (structural pass)

| Area | Change |
|------|--------|
| `social-media-workbenches.registry.source.json` | 24 SMOS workbench definitions |
| `CommunityWorkbenchKind.media` | New Prisma enum value + migration |
| `build-registry.ts` | Merges SMOS entries with `kind: media` |
| `load-smos-workbench-profile.ts` | Profile loader |
| `CommunityWorkbenchShell.tsx` | SMOS framework sections (pipeline, roles, media tags) |
| `SocialMediaCommandPanel` | Replaces dashboard KPI grid in war room |
| Hub filter | `?kind=media` on workbenches page |

Legacy `SocialResumePanel` export retained as alias → `SocialMediaCommandPanel`.

---

## Burt handoff

1. Do **not** rebuild platform tabs as a dashboard.
2. Every major SMOS area = workbench with leaders, assignments, documents, readiness.
3. Content item Prisma models (ideas, drafts, assets, publishes) are the next data layer — counts only from those records.
4. Reuse admin social stack (`src/lib/social/`, `SocialWorkbench*.tsx`) as implementation detail behind SMOS workbenches when ready.
5. Story Corps inbound API from city/coalition workbenches after Sherwood/Jacksonville pilot gate clears.

---

## Verification

- War room tab **Social Media Command** shows grouped workbench grid (no motion-presence stat grid).
- `/election-plan/workbenches?kind=media` lists all SMOS workbenches.
- `/election-plan/workbenches/content-studio` shows pipeline framework sections.
- Record counts remain **0** until real content records exist.
