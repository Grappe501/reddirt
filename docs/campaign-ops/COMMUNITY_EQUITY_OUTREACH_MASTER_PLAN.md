# Community equity — Hispanic, Marshallese, and Muslim outreach (master plan)

**Status:** Active campaign design — not a side project.  
**App integration:** Admin hub `/admin/campaign-ops/community-equity` · workflow template `s4_event_faith_venue_polling_v1` (apply to a **MEETING**-type calendar event, e.g. “Central AR — mosque polling site”).  
**Last updated:** 2026-04-27

**Cross-refs:** [`HISPANIC_SPANISH_LOCALE_LAYER_PLAN.md`](../../HISPANIC_SPANISH_LOCALE_LAYER_PLAN.md) (repo root) · [`KELLY_SOS_COMMS_READINESS.md`](../KELLY_SOS_COMMS_READINESS.md) · `docs/field-structure-foundation.md` (if present) · `src/content/events/tentativeExternalEvents.ts` for host-confirmed public events.

---

## 1. North star

These communities are **not** a translation add-on. They are **full strategic pillars**: dedicated staff attention, budget for trusted messengers, culturally competent comms, and **measurable** registration + turnout goals. Success is when field, comms, and data all **default** to “did we plan for language, faith, and diaspora**before** the press release?”

---

## 2. Pillar A — Hispanic / Latine Arkansans

| Topic | Plan |
|-------|------|
| **Geography** | NWA (Springdale, Rogers, Bentonville), Little Rock metro, River Valley, Jonesboro, Fort Smith, wherever population density and partner orgs justify pods. |
| **Voice** | Conversational U.S. Spanish (Arkansas register) — see Spanish locale plan; **human** copy review, not machine-only. |
| **Field** | Bilingual cut turf; church/festival/UAEX paths already in playbooks; student and service-worker shifts. |
| **Paid / earned** | Ethnic media and Spanish social where budget allows; partner co-branding with Latino-led orgs. |
| **KPIs (set with CM)** | Registrations captured · volunteer shifts filled · % materials in Spanish · event touches (geo-tagged). |

**Integration:** Bilingual site toggle, bilingual SMS/email when Twilio/SendGrid segments exist, county briefs in high-density counties.

---

## 3. Pillar B — Marshallese community

| Topic | Plan |
|-------|------|
| **Concentration** | Northwest Arkansas (notably Washington County / Springdale area) — do not treat as a generic “AAPI” bucket. |
| **Cultural** | **Marshallese navigators** and trusted local leaders lead messaging; national security / climate / Compact history require **care** — use community-approved framing, not campaign jargon. |
| **Language** | Marshallese + English as needed; professional interpretation for any legal/voting explainer. |
| **SOS link** | Clear, low-literacy materials on how to register, where to vote, and how the SOS office works **without** condescension. |
| **KPIs** | Partner org MOUs where applicable · navigator contact goals · event attendance. |

**Integration:** Separate row in the admin community hub (not folded under “Hispanic”). Distinct `WorkflowIntake` / county metadata tags when you label coalition work in CRM.

---

## 4. Pillar C — Muslim Arkansans (goals + current work)

| Metric | Target | Notes |
|--------|--------|--------|
| **Statewide** turnout mobilization (goal) | **~25,000** Muslim voters reached / activated (define with data: reg list match vs. universe estimate) | Model + partner lists — **not** a claim of single identity in DB without consent. |
| **Central Arkansas** | **~10,000** in the Central AR plan | Pulaski + Saline + Perry + Faulkner + Lonoke (confirm counties with data lead). |
| **Already in motion** | Met Central AR leaders; **ongoing registration drive**; **Get Loud** introduced in community | Document hosts and opt-in for public calendar when approved. |
| **Active initiative** | **Polling place in a Central AR mosque** | Use **Calendar HQ** + workflow template (below); coordinate with **county clerk / election board** and counsel on **neutral** public language (facility is a polling *site* under law, not a religious endorsement). |

**Field/comms must-haves:** prayer-time awareness, gender-sensitive staffing where relevant, Eid and Ramadan calendaring, **zero** “security theater” that alienates. **GOTV** uses mosque networks only with **imam/ board** alignment.

---

## 5. System integration (campaign manager)

1. **Admin hub** — `Community equity & faith outreach` (internal): goals, active programs, **mosque polling** checklist pointer.  
2. **Calendar event** — Create a `MEETING` (or `OTHER` if you prefer) campaign event: e.g. *“2026 — Central AR mosque as polling place — planning”*.  
3. **Workflow** — In Calendar HQ, apply template **`Faith venue — polling place (mosque, community anchor)`** (`s4_event_faith_venue_polling_v1`). Spawns `CampaignTask` rows: stakeholder MOU, county clerk, access/ADA, comms, counsel review.  
4. **GOTV module** — Tag segments for Muslim / Marshallese / Spanish-preference when the voter file and consent model allow.  
5. **Intake** — `WorkflowIntake` metadata from `/api/forms` can carry `county` and interest tags; use for Muslim/Marshallese-specific volunteer routing when you add list values.

---

## 6. Legal / comms (non-legal advice — counsel signs off)

- **Polling in faith venues:** follow Arkansas election code and county procedures; public messaging emphasizes **voter access** and **non-partisanship** of election administration.  
- **Church–state** sensitivity in any Kelly quote: SOS administers the law; does not “bless” a venue.  
- **Get Loud** — keep branding consistent with whatever agreement exists with that program.

---

## 7. Weekly operating rhythm (suggested)

| When | What |
|------|------|
| Weekly | Community pillar stand-up (15 min): Hispanic · Marshallese · Muslim — blockers, events, data. |
| Biweekly | Comms: one asset per pillar minimum (organic). |
| Monthly | Rescore goals vs. registration + early vote numbers (aggregate). |

---

## 8. Exit / success (rolling)

- [ ] Steve + CM + field leads sign numeric targets and definitions.  
- [ ] **Mosque polling** initiative has a **named** event + workflow tasks in production DB.  
- [ ] Spanish + Marshallese + Muslim partner touchpoints on the **same** org chart, not a footnote.  
- [ ] No unsourced public claims about any community’s voting behavior.

---

*COMM-EQUITY-MASTER-1*
