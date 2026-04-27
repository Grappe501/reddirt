# Approval authority matrix — Pass 4

**Legend:** LQA = lowest qualified approver. T = treasurer; C = counsel; M = campaign manager; O = owner; MCE = message/comms edge; ST = compliance or steering, per policy. Externalize = send to public, vendor, or durable record outside draft.

| Category | Who may propose / draft | Approve to externalize | Must review | Escalation owner | MI / manual hook |
|----------|------------------------|------------------------|------------|-----------------|-----------------|
| Public message (comms) | comms, MCE, NDE, field (asks) | MCE + comms (or LQA for channel) | ST if borderline | M → O in crisis | §4–5, §37 (tone + channels) |
| Paid media (buy) | paid coord, NDE, comms | T + M (+ C if ad legal); O high $ | MCE, **CONFIRMED** dollar gate | O | 3C/PAID; §36–37 |
| Finance spend in ledger | leads enter **DRAFT**; T confirms | T confirms **CONFIRMED**; O above threshold (Steve sets) | M program fit | O break-glass | §3, 5–6, 35–36; `FINANCIAL_...` |
| Contact / county list import | stewards, V.C. (with counsel packet) | M + counsel + data / treasurer as policy | T if $ linked | O | §10, 26, `CONTACT_...` |
| Voter file row access / export | data lead, stewards (admin) | O for export / break-glass; staff per policy | data lead, ST | O | §6, MI list |
| County party public outreach | stewards, schedulers | M + (NDE if public words) | T if ask $ | M | §25, Part F / 3F |
| NAACP / community | NAACP steward | M + (NDE) | no fake org facts | M | §21, NAACP plan |
| Faith / community visit (worship) | faith steward, advance | M + local counsel on edge | MCE / NDE if message | C + O on edge | `FAITH_...`, §37 |
| Youth / high school | youth coord, campus | M + youth policy + parent rules | C if minor edge | O | `YOUTH_...`, §21, 37 |
| Endorsement public ask / quote | end program, comms | M + (counsel) + (candidate if name) | MCE / NDE | O | `ENDORSEMENT_...` |
| Press release | comms | M (+ O tight window) | C if contrast / legal | O | §8–9 |
| Direct mail / postcard tranche | postcard, comms, fin | T + M ($ + copy) | MCE, counsel | T | 3G/POSTCARDS, §35–36 |
| Sign / banner / visibility (paid or deploy) | visibility, sign cap, fin | T + M (+ field if permit) | MCE, counsel | T | 3G/3H, POSTCARDS, PAID §17 |
| Commission / ambassador $ | n/a until T + C sign | O + T + C only | — | O | 3G `GRASSROOTS_...` (legal) |
| Candidate schedule (public) | advance, M, candidate | candidate (time) + CM (load) + O if risk | MCE / NDE if comms | O | `CALL_TIME`, calendar |
| Crisis response (public) | comms, CM | O (+ C) | M | O | `ESCALATION_PATHS` |
| Data export (bulk) | data lead (request) | O (policy) + log | ST, T if mixed | O | §6 |
| GOTV / regulated text | GOTV, comms | ST + (C) + T if ask $ | M | O | §3, 16 |
| Election Day incident (public) | CM, comms | O (+ C) | M | O | ch 22, ED SOPs |
| Role access (dashboard, PII, finance UI) | CM proposes roster | O + T (money) + counsel (PII) | data lead, ST | O | MI §37 |
| **Strategy** assumption / slider change (no $ yet) | CM, data (registry), **owner** | **M**+**O** to lock as **operating** baseline; counsel if affects **message** to public | ST if borderline | M → O | `INTERACTIVE_STRATEGY_...` §7–**11,** **MI** **§**38 |
| **Scenario** **“published**” (internal comms to staff) | CM, analyst | **M**+**O**; **T** if **implies** **$** in **same** week | MCE, ST | O | 4B sim §26 |
| **Budget**-**affecting** **slider** (fundraising pace, travel $, **paid,** **print,** **sign,** **postcard**) | fin lead, **CM** | **T** + **M**; **O** over threshold; **C** for **vendor**-**legal** | MCE, ST | O | 3G/3H, **§**36 |
| **Targeting** / **segmentation** **plan** **change** (recruit**/**persuade**/**GOTV** **lanes,** **geo** **focus) | comms, field, MCE | **M** + **ST** + (C if contrast); **O** for **sensitive** **rural** or **youth** | data lead, NDE | O | `SEGMENTED_...` **,** **MI** **§**38 |
| **Voter**-**file**-**derived** **audience** (any use) | data lead, **CM** (request) | **O** (policy) + **C** + **ST**; **T** if **$**-**linked** | data lead, ST | O | **§**6, 20, 38 |
| **Paid**-**media** **audience** / **creative** with **file**-**adjacency** | paid coord, NDE, comms | **T**+**C**+**M**+**MCE**; **O** over cap | MCE, ST | O | 3C/PAID, **§**38 |
| **GOTV** **targeting** / **list** / **text** | GOTV, comms, data | **ST** + **(C) **+ **T** if **$** **ask**+**M** | M | O | **§**3, 16, 38 |
| **iPad** / **device** **assignment** to **voter**-**sensitive** **work** | **CM** (roster) | **O** + (data **lead** for **DPA) **+ **T** if **funded** | ST | O | **IPAD_** **...** **,** **§**38 |

**Unknowns until Steve locks policy:** dollar thresholds, who may speak on which public channels, export matrix, youth rules, **4B** **slider** **/ scenario** **RACI** **(see** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**37–**38** **).** Register in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §1–**38**.

**Last updated:** 2026-04-28 (Pass 4 + **4B**)
