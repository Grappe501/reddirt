# Contact list intake and relationship database plan (Manual Pass 3G)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-28**  
**Public language:** Campaign Companion, Guided Campaign System, Workbench, Pathway Guide — not “AI.”

**Honesty (Steve):** **Ask** each **county** **party** for **contact** **lists** where **legally** **permitted,** then **ingest** under **consent** **/ compliance** for **recruitment** and **follow-up.** **Do** **not** **import** **PII** **without** **written** **policy** and **steward** **sign-off. ** **Do** **not** **claim** a **“list”** **exists** **in** **repo** **that** was **not** **actually** **received** **/ verified.**

**Repo:** `RelationalContact` and related Prisma types exist; **governance** of **VoterFile** **vs** **volunteer-sourced** **differs**—see `SYSTEM_READINESS_REPORT.md` and data steward lane. This pass is **SOP,** not database migration.

---

## 1. Executive summary

This plan defines how **county** **party**-sourced and **other** **lawful** **contact** **intake** flows into the **relationship** **database** (where allowed), with **source** **tagging,** **hygiene,** **dedup,** **opt-out,** and **funnel** **workflows** to **V.C.,** **donor,** **host,** and **county** **coordinator** **prospects.**

---

## 2. County party contact list request doctrine

- **Request** is **opt-in** from **party** **leadership** with **clarity** on **use** (organizing, **not** **sale** of **data).  
- **No** **implied** **state party** **endorsement** of **SOS;** local **D** list **=** **relationship** **and** **turnout** **infrastructure,** not **a** **warranty** of **volunteer** **quality.**  
- **Map** to `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` and **tour** **stops** for **list** **handoff** **moments** (ask **in** **person** with **RACI** **from** `MANUAL_INFORMATION_REQUESTS` §**26**).

---

## 3. Consent / compliance / data hygiene warnings

- **PII** **minimization;** no **sensitive** **data** in **chat,** **public** **repos,** or **screenshots.**  
- **Arkansas** **campaign** **and** **federal/where** **applicable** **rules** for **solicitation,** **coordination,** and **voter** **data**—**treasurer** **+** **counsel** **define** **lanes.**  
- **Deduplication** before **repeated** **messaging;** **opt-out** **respected** in **<** **72h** (target **<** **24h** for **email/SMS** when **in** **use).**

---

## 4. What can be requested (conceptual; counsel confirms)

- **Name,** **preferred** **contact,** **county,** **role** (volunteer, **precinct,** **donor** **interest) **as** **the** **party** **is** **willing** to **share** **and** **has** **authority** to **share.**  
- **Event** **interest** flags—**separate** from **voter** **file** **(which** **remains** **governed** **differently).**

---

## 5. What should not be imported without approval

- **Full** **voter** **file** **dumps** **from** **unauthorized** **sources**  
- **Minors** **/ students** without **youth** **plan** **rules**  
- **Data** **promised** **as** **“exclusive** **to** **another** **campaign**”**  
- **Any** **list** where **provenance** **cannot** **be** **documented**

---

## 6. Contact source tagging (SOP)

- `source=county_party_list`, `acquired_date=…`, `county_slug=…`, `consent_tier=…` **(field** **names** when **/ if** product supports—metadata on `WorkflowIntake` **or** **spreadsheet** **today).**

---

## 7. County party list intake workflow

- **Request** **→** **receipt** **(encrypted** **channel** as **per** **IT** **SOP) **→** **steward** **review** **→** **normalize** **→** **tag** **→** **dedup** **→** **import** **batch** with **log** **(who** **imported,** **when) **.  
- **No** import **of** an **entire** **unverified** **chain**-**of**-**custody** **=** **block.**

---

## 8. Deduplication

- **Match** on **email** / **phone** / **name+ZIP** as **per** **steward** **rules;** **merge** with **highest** **consent** **+** **newest** **source** **note,** not **silent** **overwrite.**

---

## 9. Opt-out / unsubscribe handling

- **One** **global** **opt-out** list **(operator);** **sync** to **comms** **tools** when **connected.**  
- **Re-ingest** **of** the **same** **list** **must** **re-check** **opt-outs** **before** **sends.**

---

## 10. Contact quality scoring (internal, honest)

- **Recency,** **engagement,** **event** **attendance,** **donation,** **volunteer** **tier—** all **low-N** **suppression** in **public;** OIS should **not** **lie** on **“heat** **without** **people**.”

---

## 11. Warm Democrat follow-up language

- **Respect,** **local,** **non-transactional** first **line;** **one** **clear** **ask** (event, **host,** P5) **MCE/NDE**-checked. **Not** in **this** **repo** as **fixed** **scripts** **with** PII.

---

## 12. Volunteer recruitment workflow

- `WorkflowIntake` **/ task** to **V.C.;** **48–72h** **from** **first** **contact** for **any** **warm** **import.**

---

## 13. Donor workflow

- **Treasurer** **path** for **solicitation;** **tranche** **escalation** from **§23** **strategy** list.

---

## 14. House party host workflow

- **Hand** to **V.C. **+** **county** **coordinator;** see **host** **SOPs** in **fundraising** **manuals.**

---

## 15. County coordinator prospect workflow

- **Ladder** **0–9** **alignment**; **not** every **import** **=** **coordinator** **ready.**

---

## 16. Dashboard requirements

- **List** **intake** **volume,** **hygiene** **errors,** **dedup** **rate,** **follow-up** **SLA,** **opt-out** **compliance** **%** (operator).

---

## 17. Data steward responsibilities

- **RACI** in **`MANUAL_INFORMATION_REQUESTS` §6** and **voter** **steward** **role;** this **adds** **county** **list** **provenance** **ledger.**

---

## 18. Compliance questions for counsel (non-exhaustive)

- **Solicitation** from **county** **party**-derived **lists** in **Arkansas** **SOS** **context;** **coordination** **rules;** **record**-**keeping** for **$** **and** **in-kind** **(host** **food** **/ venue).**

---

## 19. Steve decision list

- **Written** **policy** to **govern** **county** **party** **list** **requests** **+** **storage.**  
- **What** the **state** / **county** **parties** **are** **comfortable** **providing;** **what** is **off-limits.**  
- **DPA** or **analog** for **vendors** that **see** **lists.**  
- **Who** **signs** **import** **batches** **(data** **steward** **+** **treasurer?).

**Last updated:** 2026-04-28 (Pass 3G)
