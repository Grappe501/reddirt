# Public site media slot map

**Pass:** `KELLY-PUBLIC-HARDENING-1.0` (Pass 0 infrastructure)  
**Lane:** RedDirt public site  
**Authority:** [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md) · [`PUBLIC_CORE_MESSAGE_MAP.md`](./PUBLIC_CORE_MESSAGE_MAP.md) · [`PUBLIC_SITE_MASTER_MAP.md`](./PUBLIC_SITE_MASTER_MAP.md)

**Rule:** Media is proof, not decoration. Unknown geography stays Unknown. Empty endorsements stay empty until confirmed.

**Components:** `MediaPageHero` · `PublicMediaSlotFrame` · registry `src/lib/public-media/slot-registry.ts`  
**Operator assign:** `/admin/owned-media/public-placements`

---

## Story fidelity checklist (per ★ route)

| Route | One job | Core claim + proof slot | Exit thought | Page CTA | Hesitations |
| --- | --- | --- | --- | --- | --- |
| `/` | Trust + interest | Office belongs to people · `home.hero.*` | I know who she is and why to pay attention | Meet Kelly / Join | Home spine frozen; Meet Kelly band glue in Pass 5 |
| `/about` | Qualifications | Relevant experience · `about.hero` / `about.portrait` | She can do this job | Priorities / Journey | Text cliff after portrait — keep short |
| `/about/journey` | Listening proof | Shows up · `journey.hero` | She is moving through Arkansas | From the Road | Only confirmed geography in captions |
| `/about/community` | Community ties | People like me · `community.hero` | She knows communities | Join | Soft; don’t invent places |
| `/about/why-im-running` | Why this office | Prepared to serve · `why.hero` | Clear motive, not memoir | Priorities | Avoid adjective pile |
| `/priorities` | Governing approach | Understands the job · `priorities.hero` | I know what she’d do / not do | Get Involved | Limits stay here |
| `/kelly-speaks` | Hear Kelly | Primary voice · `speaks.hero` / `speaks.featured` | I heard her | Meet Kelly / Join | Video dominant |
| `/campaign-photos` | Trail photos | Authentic activity · `campaign-photos.intro` | Real campaign evidence | Journey / Road | Gallery is primary below |
| `/endorsements` | Third-party | Confirmed only · `endorsements.hero` | Honest about what’s confirmed | — | Empty OK |
| `/understand` | Office explainer | Work touches life · **PageHero** (no media until process-true still) | I get the office | Office areas | Not memoir |
| `/office/*` | Area depth | Service detail · `office.hero` when proof exists | This area matters | Priorities | Layer-2 only |
| `/direct-democracy` | People power | Regnat Populus · `dd.hero` | Process is for people | Ballot process | Calm, not theater |
| Ballot process | Civic how-to | **PageHero only** until process-true still | Clear steps | Official links | No campaign wallpaper |
| `/from-the-road` | Trail notes | Active now · `road.hero` | Campaign is documenting | Events | Release-only |
| `/press-coverage` | Press | External coverage · `press.hero` | Sourced stories | Road | No invented clips |
| `/events` | Calendar | Presence · `events.hero` | I can show up | Request | Calendar primary |
| `/schedule` | Schedule | Presence · `schedule.hero` | Clear dates | Events | Keep thin |
| `/listening-sessions` | Listening | Shows up · `listening.hero` | Invitation to be heard | Request | Soft proof |
| `/arkansas` | Statewide map | Geography · `arkansas.hero` | Statewide presence | Counties (soft) | Don’t merge counties OS |
| `/get-involved` | Convert | Participation · `get-involved.hero` | I know how to help | Forms | Join → Volunteer → Donate last |
| `/donate` | Grassroots give | Support · `donate.hero` | Clear external path | GoodChange | Not first CTA elsewhere |
| `/contact` | Reach campaign | Access · `contact.hero` | I can write in | Form | Footer reachable |
| `/voter-registration` | Vote path | Civic access · `voter-reg.hero` | Official path clear | Official links | Disclaimer |
| Legal | Trust docs | — (no media slots) | Clear terms | — | Spacing only |

---

## Slot inventory (inner pages)

| pageKey | slotKey | Preferred | Static fallback |
| --- | --- | --- | --- |
| about | about.hero | Landscape trail / ops | arkansasPorch |
| about | about.experience | Experience band | arkansasPorch |
| about | about.portrait | 4:5 portrait | arkansasPorch |
| about-journey | journey.hero | Across Arkansas still | heroHome |
| about-journey | journey.strip | Secondary proof | editorialDefault |
| about-community | community.hero | Community still | arkansasPorch |
| about-why | why.hero | Why-running still | arkansasPorch |
| priorities | priorities.hero | Filings / work still | splitLabor |
| kelly-speaks | speaks.hero | Video preferred | heroHome |
| kelly-speaks | speaks.featured | Featured message video | heroHome |
| campaign-photos | campaign-photos.intro | Intro still | heroHome |
| endorsements | endorsements.hero | Soft; labeled empty OK | editorialDefault |
| understand | understand.hero | Capitol / office | splitDemocracy |
| office | office.hero | Area still | splitDemocracy |
| direct-democracy | dd.hero | People / process | splitDemocracy |
| direct-democracy | dd.ballot.hero | Process visual | explainerSteps |
| from-the-road | road.hero | Latest trail | heroHome |
| press-coverage | press.hero | Press still | editorialDefault |
| events | events.hero | Presence | heroHome |
| events | events.request.hero | Invite Kelly | arkansasPorch |
| schedule | schedule.hero | Presence | heroHome |
| listening-sessions | listening.hero | Listening still | arkansasPorch |
| arkansas | arkansas.hero | Statewide | heroHome |
| get-involved | get-involved.hero | Proof still | arkansasPorch |
| donate | donate.hero | Soft proof | arkansasPorch |
| contact | contact.hero | Soft | editorialDefault |
| voter-registration | voter-reg.hero | Civic | splitDemocracy |
| host-a-gathering | host-gathering.hero | Gathering proof | arkansasPorch |
| start-a-local-team | local-team.hero | Team proof | arkansasPorch |

Homepage slots remain `home.*` (unchanged keys).

---

## Legal / no-slot pages

`/privacy`, `/accessibility`, `/terms`, `/disclaimer` — typography and spacing only; no `PublicMediaPlacement` slots.
