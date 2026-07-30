# Evidence Workbench — Magical AI Super Upgrade

**Pass:** `KELLY-EVIDENCE-AI-MAGICAL-SUPER-1.0`  
**Lane:** RedDirt  
**Date:** 2026-07-30  
**Doctrine:** Prefer Unknown · no silent Approve/Confirm/encode/render/curate · local writes only

---

## What we taught the AI to do

| Capability | How operators use it |
| --- | --- |
| **Command Center** | Freeform natural language across calendar / photos / videos / intake / placement / ship |
| **Next Actions strip** | Deterministic ranked backlog (Unknown stills, intake, approve, calendar, speeches, ship) |
| **Calendar Suggest places** | ICS text → proposed city/county at **Needs confirm** max — Apply to form, never auto-Confirm |
| **Event-night pack** | One calendar row → cue-aligned photos + speeches + recommended clicks |
| **Command mode** | Full cross-surface tool surface (photo + video tools) with confirm gates |
| **New tools** | `rank_evidence_next_actions`, `propose_event_night_pack`, `suggest_calendar_presence_fields` |

---

## What the AI still will not do

- Invent geography, people, or dates
- Treat Needs confirm as Confirmed proof
- Silent Approve / Publish / Confirm / encode / render / turbo / curate apply
- Rewrite `campaign-photo-registry.ts` (graduation stub only)

---

## Files

- `src/lib/campaign-media/evidence-ai-command.ts`
- `src/lib/campaign-media/evidence-next-actions.ts`
- `src/lib/campaign-media/evidence-event-night-pack.ts`
- `src/lib/campaign-media/evidence-calendar-ai.ts`
- Modes / tool-defs / tool-runtime / brain SYSTEM updates
- UI: `EvidenceAiCommandCenter`, `EvidenceNextActionsStrip`, Calendar AI buttons
- Actions: `runEvidenceAiCommandAction`, `rankEvidenceNextActionsAction`, `proposeEventNightPackAction`, `suggestCalendarPresenceAiAction`

---

## Example commands

1. “What should I do next on the Evidence Workbench?”
2. “Propose an event-night pack for calendar row \<id\>.”
3. “Suggest places for this Needs confirm calendar stop — Prefer Unknown.”
4. “Where are Unknown-county stills blocking Approve?”
5. “Build a ship checklist — what still needs commit?”

---

## Status

Shipped on `feature/kelly-schedule-settlement-dashboard`. Open `/admin/evidence-workbench` (localhost) with `OPENAI_API_KEY` set.
