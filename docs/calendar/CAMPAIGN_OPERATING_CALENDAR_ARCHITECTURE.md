# Campaign Operating Calendar — architecture doctrine (locked)

**Status:** LOCKED — 2026-07-28  
**Lane:** RedDirt (canonical campaign OS)  
**Not:** Embed `Kelly-calendar` as a separate app inside the public website  
**Is:** Promote the calendar into the campaign operating system — one event, many outputs, visibility by audience

**Launch note:** Public website craftsmanship still prioritizes **production confidence** first ([`REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md`](../website/REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md)). This calendar OS track may proceed in parallel only with an approved integration packet; it must not enlarge public marketing pages without Steve authorization.

---

## Guiding idea

Do **not** think:

> Move the calendar into the website.

Think:

> **Promote the calendar into the campaign’s operating system.**

Public website, staff, volunteers, mission planning, travel, media, and relationship management all draw from the **same canonical event data**, each through role-appropriate views.

---

## Target architecture

```text
RedDirt
│
├── Public Website          (consumes PUBLIC events only)
├── Campaign Calendar       (canonical operating calendar)
├── Mission System
├── Events / Speaking
├── Travel
├── Volunteer Activities
├── Press
├── Relationship / follow-up
└── Admin Workbench
```

**Rejected pattern:**

```text
Kelly-calendar/  →  Separate App  →  Public Website
```

---

## One event, many outputs

Example: Jonesboro Meet & Greet

```text
Campaign Calendar (canonical)
        ↓
Homepage “Kelly’s Next Stops” / On the Road
Events page
County page
Campaign Journey
Volunteer schedule
Mission preparation
Press calendar
Photo / video galleries
Relationship follow-up
Fundraising follow-up
```

Nothing should require double entry for the same occurrence.

---

## Visibility levels (one event model)

| Level | Examples |
| --- | --- |
| **Public** | Campaign events, meet & greets, speaking, county visits, volunteer opportunities, press conferences |
| **Internal campaign** | Travel, hotels, strategy/finance/staff meetings, draft events, personal campaign scheduling |
| **Kelly only** | Family, medical, personal, private meetings |

Unauthenticated visitors never see Internal or Kelly-only records.

---

## Public homepage integration

Do **not** show a traditional calendar grid on `/`.

Show **Kelly’s Next Stops** — simple, friendly, always current:

```text
July 30 · Greene County
Meet & Greet
Learn More
```

Proof of activity without operator complexity.

---

## Mission + relationship heartbeat

Calendar drives time-based campaign work:

```text
Today → Mission → Briefing → County → People → Media → Tasks → Debrief → Follow-up
```

Mission lifecycle attaches to events: Prepare → Travel → Execute → Debrief → Follow-up.

Events connect to people (attendees, county chairs, volunteers, donors, media, local leaders) for Relationship Command Center workflows.

---

## Target folder shape (eventual)

```text
H:\SOSWebsite\RedDirt\src\calendar\
  core\      # canonical event schema, visibility, publish rules
  events\
  missions\
  travel\
  public\    # website consumers (Next Stops, /events)
  admin\
  api\
  components\
  sync\      # Google / Mobilize / import bridges

H:\SOSWebsite\RedDirt\docs\calendar\
```

Migrate `H:\SOSWebsite\Kelly-calendar` **into** this structure over time — do not keep it as the long-term sibling SoT for campaign operations.

---

## Current state (inventory snapshot — 2026-07-28)

| System | Role today | Risk |
| --- | --- | --- |
| **Kelly-calendar** (`kelly-campaign-command-calendar`) | Rich operator calendar OS; Prisma schema `kelly_calendar`; Event SoT for KCCC | Separate app, separate Event model |
| **RedDirt** | Public site publish via `CampaignEvent` + `isPublicOnWebsite` + `PUBLISHED`; admin CCC / `/kelly/calendar` / Google sync | Parallel SoT; promotion bridge already partial |

**Bottom line today:** two apps, shared Postgres hosting, **two sources of truth**. Public website publish is owned by RedDirt. Operator federation depth lives in Kelly-calendar. Migration needs an explicit mapping/promotion layer — **not** a blind code copy or cross-import without an approved integration packet.

Workspace hard rule remains: no casual imports across lanes / sibling apps without Steve-approved integration packet.

---

## Migration strategy (phased)

### Phase 1 — Inventory

Reusable components, routes, data models, APIs in `Kelly-calendar`. Document overlaps with RedDirt `CampaignEvent` / CCC.

### Phase 2 — Canonical schema

Design RedDirt-owned campaign event schema (visibility Public / Internal / Kelly-only + publish contract for website). Map KCCC `Event` → canonical model.

### Phase 3 — Incremental move

Port features into RedDirt calendar subsystem; verify after each step. Keep public website consumers (`isPublicOnWebsite`) stable.

### Phase 4 — Retire sibling SoT

When essential operator + public surfaces run on RedDirt canon, retire standalone Kelly-calendar as live SoT (archive reference only).

---

## Do not

- Embed the full Kelly-calendar app iframe-style into the marketing site  
- Expose Internal / Kelly-only events on public routes  
- Double-enter the same stop for journey, events, and volunteer surfaces  
- Collapse schemas by force without a publish/visibility contract  
- Divert public launch craftsmanship away from production confidence without Steve authorization  

---

## Related

- Kelly-calendar: `H:\SOSWebsite\Kelly-calendar\docs\CALENDAR_FEDERATION_ARCHITECTURE.md`  
- RedDirt public gate: `src/lib/calendar/public-events.ts`  
- RedDirt CCC docs: `docs/calendar-command-center/`  
- Website craftsmanship board: [`../website/REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md`](../website/REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md)  
