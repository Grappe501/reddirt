# Campaign Communications Hub (CCH) Doctrine

**Status:** Structural doctrine · **Lane:** `RedDirt/` · **Audience:** Burt, Kelly, comms leads  
**Updated:** 2026-06-16  
**Related:** [`SOCIAL_MEDIA_OS_MIGRATION.md`](./SOCIAL_MEDIA_OS_MIGRATION.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md), [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md)

---

## Problem

Most campaigns treat channels as separate silos:

```text
Facebook · Instagram · Email · Website · X · YouTube · TikTok · SMS
(all separate — no source of truth)
```

Kelly SOS should not operate that way.

### Campaign Communications Doctrine

**Most campaigns:**

```text
Facebook · Instagram · Email · Website · X · YouTube · TikTok · SMS
(each channel managed independently)
```

**Kelly SOS:**

```text
Kelly
 ↓
Substack (source of truth)
 ↓
Communications OS (CCH)
 ↓
Social Media OS (platform workbenches)
 ↓
Public interaction → engagement routing
```

One source of truth. Many outputs. Kelly communicates once; the system handles distribution, adaptation, tracking, engagement, and follow-up.

---

## Target architecture

**Substack is the Campaign Communications Operating System** — not a blog, not a newsletter strategy.

```text
Kelly
 ↓
Substack (source of truth)
 ↓
Communications OS (CCH workbenches)
 ↓
Social Media OS (platform workbenches)
 ↓
Public interaction
 ↓
Engagement routing (Kelly responds once → routed publish)
```

One source of truth. Many outputs.

---

## Four operating systems (campaign backbone)

```text
Community Workbench OS   → people & field operations
PPEN                     → growth & participation
Social Media OS (SMOS)   → content & narrative operations
Campaign Communications Hub (CCH) → Kelly's voice & distribution doctrine
```

County intelligence, coalition intelligence, and executive strategy **feed into** these systems.

---

## Public Substack = Campaign Public Communications Hub

All signup roads lead here:

```text
Website signup · Volunteer signup · Event signup · QR codes · Social media · Referrals
```

### Public feed = Kelly's Public Voice

Campaign updates · thoughts from the road · county visits · issue positions · videos · photos · endorsements · event recaps.

---

## Insider feed = Campaign Insider Network

**Not** donors-only. **Not** paid members. **Not** "premium content."

Access granted through:

```text
Volunteering · Donating · Leadership participation · Approved campaign involvement
```

### Membership language (legal)

Use **Campaign Insider Access** — not "lifetime membership":

```text
Granted for campaign participation, volunteering, support,
or other campaign involvement.

Access may be suspended or revoked for misuse, harassment,
security concerns, legal compliance, or actions contrary to campaign policies.
```

### Insider feed replaces

Campaign newsletter · volunteer email blasts · insider updates · training announcements · early briefings.

Content types: behind the scenes · field updates · what we're seeing · volunteer/leadership opportunities · campaign priorities · insider briefings · training · early announcements.

---

## Candidate Communications Workbench

The major hub workbench. Contains:

| Section | Workbench |
|---------|-----------|
| Public feed | `substack-public-feed` |
| Insider feed | `substack-insider-feed` |
| Platform distribution | SMOS platform workbenches |
| Calendar | `communications-calendar` |
| Message library | `message-library` |
| Engagement routing | `engagement-routing` |
| Master list | `master-communications-list` |

Registry: `data/campaign-brain/campaign-communications-workbenches.registry.source.json`  
Prisma kind: `CommunityWorkbenchKind.communications`

---

## Kelly posts once

Kelly writes a Substack post (canonical record). Phase 2+ system generates:

```text
Facebook · Instagram · Threads · X · TikTok · LinkedIn · Email snippet · Website summary
```

Each platform has different style rules. Flow:

```text
Substack Post → Platform Adaptations → Approval → Publish (SMOS)
```

Phase 1: manual adaptations in platform workbenches. Phase 2: automated generation with human approval.

---

## Engagement routing

| Inbound | Routes to |
|---------|-----------|
| Facebook comment | Facebook Workbench |
| Instagram DM | Instagram Workbench |
| Substack comment | Substack / CCH workbench |
| X reply | X Workbench |

Kelly replies **once**. System tracks origin platform and publishes the response correctly.

---

## Master Communications List doctrine

**Master list** = anyone who intentionally opts in through any campaign channel.

Segments (same system, not separate tools):

```text
Public · Volunteer · Leader · Donor · Insider · County · Coalition
```

---

## PPEN integration (when pilot gate clears)

| Event | Access |
|-------|--------|
| Volunteer form approved | Level 1 → Public feed subscription |
| Volunteer becomes active | Insider feed access (automatic) |

PPEN handles participation tiers; CCH handles communications access — linked records, not duplicate lists.

---

## Phase 1 vs Phase 2

| Phase | Scope |
|-------|--------|
| **Phase 1 (now)** | CCH workbench structure, feeds framework, calendar, message library, engagement routing slots, master list doctrine |
| **Phase 2** | Substack post → platform adaptation generation, engagement API routing, PPEN access automation |
| **Phase 3** | Platform auto-publish after approval (Facebook, Instagram, etc.) |

Content operations and source-of-truth discipline matter more than publishing automation.

---

## Burt handoff

1. Do **not** treat Substack as a newsletter product — treat it as **CCH**.
2. Kelly communicates once; the system handles distribution, adaptation, tracking, engagement, and follow-up.
3. CCH workbenches use the same Community Workbench engine (leadership, assignments, documents, readiness).
4. SMOS platform workbenches are **downstream** of CCH — not parallel silos.
5. Substack post = canonical Prisma record (Phase 2 data layer); platform posts = child adaptation records.
6. Reuse existing email/comms stack (`src/lib/email/`, message studio) as implementation behind master list when ready.

---

## Verification

- Election Plan → **Campaign Communications** tab → CCH workbench hub grid
- `/election-plan/workbenches?kind=communications`
- `/election-plan/workbenches/candidate-communications` → pipeline + approval chain framework
- `/election-plan/workbenches/substack-insider-feed` → Campaign Insider Access framework note
- Record counts remain **0** until real comms records exist
