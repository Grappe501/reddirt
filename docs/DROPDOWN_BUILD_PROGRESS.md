# Dropdown build progress (internal)

**Audience:** campaign engineering and content leads — not a public page.

Summary of primary navigation “mega menu” workstreams and what remains.

| Dropdown       | Status      | Structure                                      | Routes                     | Copy        | UX              | Remaining                                      |
| -------------- | ----------- | ---------------------------------------------- | -------------------------- | ----------- | --------------- | ---------------------------------------------- |
| Meet Kelly     | Built       | Chapters / earned bio pathways                 | Complete                   | Drafted     | Polished        | Kelly review pending                           |
| The Office     | Built       | WHY → HOW → WHAT (3-layer office pathways)     | Complete                   | Drafted     | Coherence pass  | Final legal / tone QA                        |
| News           | Scaffolded  | Credibility engine (trail, press, updates, etc.) | Basic routes               | Placeholder | Basic           | Content / feed phase later                     |
| Events         | In progress | Invite Kelly (3-layer) + calendar + strategy   | Invite pathway + subroutes | Drafting    | Pathway + hubs  | Calendar integration, fair research, map later |
| Get Involved   | Not started | Volunteer / donate / relational onboarding       | TBD                        | TBD         | TBD             | Full build                                     |
| Search/utility | Partial     | Search, vote/register CTAs                     | TBD                        | TBD         | TBD             | Review later                                   |

## Invite Kelly pathway (Events)

- **Layer 1 — Why:** `/events/request`
- **Layer 2 — How:** `/events/request/how-it-works`
- **Layer 3 — What:** `/events/request/what-you-can-host`

Layer 2 and 3 are intentionally **not** separate items in the Events dropdown; entry is **Invite Kelly** → Layer 1 only.

## Heavy-lift integrations (deferred)

- Google Calendar — approved public read-only feed
- Pending approval calendar / internal workflow before anything is public schedule
- County fair 2026 verified research pipeline
- County map / visit status system (no fake markers)
- Google Maps / travel history import
- Curated vertical video library
- Social feed modules on news/events surfaces

_Config and copy source of truth for Invite Kelly: `src/content/events/invite-kelly.ts`._
