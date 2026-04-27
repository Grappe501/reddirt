# Google Calendar and event pipeline operating system (Manual Pass 3G)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-28**  
**Public language:** Campaign Operating System, Workbench, Pathway Guide — not “AI.”

**Honesty:** Do not overstate sync between Google Calendar and `CampaignEvent` / public calendar UI. Reconciliation SOP is mandatory (see `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `SYSTEM_READINESS_REPORT.md`). Do not put calendar IDs, API keys, or secrets in this manual. **75 counties × ≥3 visits** by general election is a **planning target**—track honestly; do not claim completion without field truth.

**Repo:** `CampaignEvent`, Google sync fields in schema, workbench calendar—Pass 3G does not change code.

---

## 1. Executive summary

One governed pipeline from **idea → invite → hold → close the loop**: event statuses match **Steve’s** operating need; every item that reaches **confirmed** should spawn **support workflows** (text, email, local ads, phone bank, postcards, press, social, county party amplification, compliant guerrilla tactics) **only** with named owners and treasurer/MCE gates where applicable.

---

## 2. Google Calendar as calendar of record

- **Primary** working calendar for CM/ops (Google or Microsoft—**Steve** picks; this doc says “GCal” as placeholder).  
- **Mirror** into `CampaignEvent` for anything public, finance-attached, or reportable—per compliance.  
- **Single** reconciliation owner and weekly diff review (see §13).

---

## 3. Event statuses

| Status | Meaning |
|--------|--------|
| **recommended** | Internal idea; not yet asked of host/venue |
| **invited** | Request sent; no commitment |
| **tentative** | Soft hold; permits/parking/backup open |
| **confirmed** | On calendar; MCE/NDE if public remarks; advance checklist green |
| **visited** | Candidate/surrogate attended; debrief may be open |
| **completed** | Debrief done; follow-up closed or owned |
| **cancelled** | Killed with reason (weather, host, compliance) |
| **needs follow-up** | Open tasks past SLA (V.C., $, press, local promo) |

Map labels via calendar description line `status:confirmed` (example) and/or private ops spreadsheet until product fields exist.

---

## 4. Event intake

- Sources: `WorkflowIntake`, volunteer form, V.C. phone, host captain, `MANUAL` immersion pipeline.  
- Create draft block + link to county (`county_slug` in SOP metadata).

## 5. Event approval

- **CM** for candidate time; **treasurer** for any soliciting venue; **MCE/NDE** for public content; **compliance** for high-risk rooms.

## 6. Travel logistics

- Pair with `WEEKLY_TRAVEL_...` and `FinancialTransaction` + `relatedEventId` when travel spend ties to event.

## 7. Candidate availability constraints

- **Breakfast / lunch / after-5** default; PTO for work only when CM approves; see `CALL_TIME_...` and `IMMERSION_...`, `MANUAL_INFORMATION_REQUESTS` §28.

## 8. Local host assignment

- Host captain + advance/handler (when staffed); `IMMERSION_...` RACI.

## 9. Promotion workflows (per confirmed event)

- **Text** (opt-in lists only), **email**, **local ads** (compliant), **phone bank** (if list lawful), **postcards** (if in batch), **press** (MCE), **social** (approved creative), **county party** (relationship lane), **guerrilla** (legal, ethical, no astroturf).

## 10. Event support task templates (examples)

- `evt_confirm_{id}`, `evt_promo_{id}`, `evt_press_{id}`, `evt_72h_{id}`. Store in Workbench; field names SOP.

## 11. Post-event 72-hour follow-up

- Same discipline as county tour §9: no ghost signups.

## 12. 75 counties × 3 visits target

- Internal heat map: “touch count” per county—not OIS fraud if data thin; acquisition tasks when unknown.

## 13. Weekly calendar review

- CM + scheduler: conflicts, `needs follow-up` backlog, next two weeks pipeline.

## 14. 4-week rolling schedule

- Align `WEEKLY_TRAVEL_...` §16–17 with GCal **tentative**/**confirmed** density.

## 15. 12-week travel map

- Same doc §17; GCal = planning layer; `CampaignEvent` = system of record for public-facing truth.

## 16. Dashboard requirements

- **Status** distribution, **overdue** follow-ups, **$** with `relatedEventId`, **host** readiness score, no fake RSVP counts.

## 17. Repo support and gaps

- `CampaignEvent` exists; full bidirectional GCal↔Prisma may need ongoing manual reconciliation—**document** in ops, do not claim “always synced” in public.

## 18. Steve decision list

- **Which** system is calendar of record (Google vs hybrid with DB).  
- **Reconciliation** cadence and owner.  
- **75×3** reporting honesty rules.  
- **Integration** budget if automation later.

**Last updated:** 2026-04-28 (Pass 3G)
