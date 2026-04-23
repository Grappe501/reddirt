# Position development matrix (RedDirt)

**Packet TALENT-1.** System-oriented development view: **competencies**, **early fit**, **risk**, **training**, **observables**, **upward** **path**, **reviewer** for **advancement** **recommendations**—**not** HR performance reviews. One row per **ROLE-1** **position** ([`workbench-job-definitions.md`](./workbench-job-definitions.md), [`positions.ts`](../src/lib/campaign-engine/positions.ts)). **TALENT-1** does not implement logging or metrics.

**Cross-ref:** [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`talent-recommendation-flow.md`](./talent-recommendation-flow.md)

---

## Template (field meanings)

- **Core competencies:** What “good” looks like in **this** **seat** in **RedDirt**.
- **Early fit:** **Signals** in **first** **2–4** **weeks** (where **data** **exists**).
- **Risk / weakness:** **Patterns** that should **not** get **more** **authority** without **human** **review**.
- **Training focus:** **Adaptive** **tracks** to **start** (conceptual; content rail later).
- **Metrics (eventual):** **Observable** **counters** **/ rates** from **tasks, queues, sends, intakes.**
- **Upward path:** **Natural** **next** **seat** in **tree** or **lateral** **to** **another** **department** **(rare).**
- **Advancement reviewers:** **Who** should **see** “ready for X” **recommendations** (advisory).

---

## Campaign Manager (`campaign_manager`)

| Field | Content |
|-------|---------|
| **Core competencies** | Cross-queue orchestration; **legal/comms/field** tradeoff judgment; **calm** under **exception** volume. |
| **Early fit** | `workbench` **health** **cards** **trending**; **intake** **and** **queue** **age** **under** **control**; **no** **unforced** **errors** on **sensitive** **sends**. |
| **Risk** | **Chronic** **blind** **spots** (one** **queue** **always** **red**); **bypassing** **Compliance** on **jurisdiction**-**sensitive** work. |
| **Training** | **Full** **map** of **workbenches**; **Crisis** comms; **treasury** **(coordination** with **Finance**). |
| **Metrics** | **Aggregate** **SLA** **across** **domains**; **exception** **rate** **from** **automation**; **time** **to** **ack** on **escalations**. |
| **Upward** | **None** in-tree. |
| **Reviewers** | **Party** / **self**; **N/A** for “promotion” **(top** **of** **tree)**. **Talent** **recs** to **CM** = **advisory** **self**-**or** **stakeholder** only. |

## Assistant Campaign Manager (`assistant_campaign_manager`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Cross-dept** **task** **/ calendar** / **ingest** **throughput**; **triage** **to** the **right** **director** **without** **over**-**ruling** **them** **in** **public**. |
| **Early fit** | **Task** **and** **event** **backlogs** **move**; **data** / **voter** **ask**s **routed** **to** **Data** **Manager** **correctly** **(handoff** **quality)**. |
| **Risk** | **Becoming** a **bottleneck**; **frequent** **calendar** **collisions** **without** **raising** to **Comms/Field** **directors** **. |
| **Training** | **Event** **readiness** **patterns**; **voter** **ingest** **SOP**; **delegation** **to** **leads** **(not** **owning** **every** **row)**. |
| **Metrics** | **Overdue** **task** **count** **by** **department**; **event** **readiness** **%**; **voter** **snapshot** **freshness** **(with** **Data**). |
| **Upward** | **Deputy** **/ acting** **CM** **(rare,** **human**). |
| **Reviewers** | **Campaign** **Manager** **(required).** |

## Communications Director (`communications_director`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Message** **priority**; **arbitration** between **comms** **/ social** / **press**; **says** **no** to **bad** **timing** or **unreviewed** **earned** **. |
| **Early fit** | **Plans** and **sends** **on** **pace**; **email** **workflow** **/ thread** **SLA** **sane**; **low** **unnecessary** **rework** on **content** **(with** **Content** **Manager)**. |
| **Risk** | **Pushing** **sends** around **Compliance**; **dismissing** **queue-first** on **sensitive** **touches** **. |
| **Training** | **Tier** **/ segment** **policy**; **earned** **vs** **paid**; **opposition** **(with** **Oppo** **+** **Compliance**). |
| **Metrics** | **Send** **success** **rate**; **email** **queue** **age**; **plan** **bottlenecks** **(with** **content**). |
| **Upward** | **CM**; **(rare** **lateral** **to** **Field** if **reorg**—**not** **default**). |
| **Reviewers** | **CM**; **Compliance** for **jurisdiction**-**sensitive** **messaging** **(advisory** **on** **trust**). |

## Field Director (`field_director`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Geographic** **coverage**; **conflict** **resolution** between **counties**; **field**-**comms** **handoffs** **clean** **(intakes,** **not** **DMs**). |
| **Early fit** | **Festival** **/ local** **ingest** **flowing**; **county** **gaps** **closed** or **escalated**; **field** **tasks** **on** **time** **. |
| **Risk** | **Hiding** **voter** **/ data** **asks**; **safety**-**sensitive** **event** **greenlight** without **Comms+Compliance** **. |
| **Training** | **Turf** **SOPs**; **VAN**-**style** **or** **RedDirt**-**specific** **list** **hygiene** **(Data** **pairing**). |
| **Metrics** | **Counties** **without** **owner**; **festival** **pending**; **field** **task** **overdue** **(county** **sliced**). |
| **Upward** | **Deputy** **/ regional** **(human**). |
| **Reviewers** | **CM**; **Comms** **Director** for **messaging-**affecting** **moves** **(advisory**). |

## Finance Director (`finance_director`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Filing** **/ disclosure** **rhythm**; **blocking** **unapproved** **spend** **classes**; **interface** to **vendors** **(often** **OOB**). |
| **Early fit** | **No** **unexplained** **vendor** **/ send**-**tied** **outflows** **in** **system** **where** **mapped** **. |
| **Risk** | **Pressure** to **bypass** **compliance** for **“fast”** **spend** **. |
| **Training** | **FEC/ state** **(off** **or** **in** **app**); **coordinated** **expenditure** **basics** **. |
| **Metrics** | **Deadline** **miss** **=0** **(external** **flag)**, **(future)** **app**-**tied** **reconciliation** **. |
| **Upward** | **None** in-tree. |
| **Reviewers** | **CM**; **Compliance**; **(treasurer** **/ counsel** OOB**). ** |

## Compliance Director (`compliance_director`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Red** **line** on **jurisdiction-**sensitive** **comms** **and** **data**; **veto** **/ redirect** with **traceable** **rationale** **(future** **log)** **. |
| **Early fit** | **Catches** **disclaimer** / **disclosure** **gaps** **before** **ship**; **voter** **file** **use** **reviewed** **. |
| **Risk** | **Over**-**blocking** **or** **under**-**documenting** **(both** **harm**). |
| **Training** | **State**-**specific** **(coordination,** **disclaimer**); **Oppo** **release** **(with** **Oppo+Comms**). |
| **Metrics** | **#** of **sensitive** **sends** **with** **documented** **check**; **(future)** **override** **rate** **. |
| **Upward** | **None**; **(counsel** OOB**). ** |
| **Reviewers** | **CM**; **(legal** **outside** **counsel** OOB**). ** |

## Email/Comms Manager (`email_comms_manager`)

| Field | Content |
|-------|---------|
| **Core competencies** | **`EmailWorkflowItem` **triage** **;** **thread** **response** **cadence** **;** **discipline** on **not** conflating **queue** with **authoritative** **send** **(handoff) **. |
| **Early fit** | **Time-to-first** **touch** on **assigned** **queue**; **low** **error** path **on** **`CommunicationSend` **(when** **in** **remit**). |
| **Risk** | **Hasty** **triage** on **sensitive** **items**; **ignoring** **provenance** **(E-2** **interpretation**). |
| **Training** | **Queue-first**; **comms** **/ email** **workflow** **boundary**; **segment** **+** **consent** **(with** **Data**). |
| **Metrics** | **Queue** **age** **by** **assignee**; **rework** after **Comms** **Director** **/ Compliance** **flags** **. |
| **Upward** | **Comms** **Director**; **(lateral** **to** **Content** **/ Social**). |
| **Reviewers** | **Comms** **Director**; **Compliance** for **messaging-**sensitive** **(advisory**). ** |

## Content Manager (`content_manager`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Asset** **+** **story** **pipeline**; **on-brand** **/ **legal-** **safe** **copy** with **Oppo+Compliance** **on** **claims** **. |
| **Early fit** | **Review** **queue** **moving**; **stories** **aligned** to **plan** **windows** **(when** **linked**). |
| **Risk** | **Publish** without **Oppo+Compliance** on **sensitive** **lines**; **DAM** **chaos** **(lost** **assets**). |
| **Training** | **Editorial** **SOP**; **endorsement** / **Oppo** **(with** **Oppo** **lead**). |
| **Metrics** | **Time** **in** **review**; **asset** **stuck** **states**; **(future)** **defect** **rate** on **published** **claims** **(human** **audit**). ** |
| **Upward** | **Comms** **Director** **(primary**); **(lateral** **rare**). |
| **Reviewers** | **Comms** **Director**; **CM** for **narrative**-**affecting** **moves** **(advisory**). ** |

## Social Media Manager (`social_media_manager`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Opp** **/ cluster** **triage**; **knows** when **to** **hand** to **email** **workflow** **or** **intake** **(not** **DM**-**shaped** **policy** in **app**). |
| **Early fit** | **Orchestrator** + **social** **queues** **not** **stale**; **conversions** to **intake** when **process** **says** ** so** **. |
| **Risk** | **Unreviewed** **reactive** public **replies**; **mixing** **voter** **or** **donation** **asks** without **Comms+Finance** **. |
| **Training** | **Queue-first** **(policy)**; **platform** **TOS**; **hand** **to** **Press** for **reporter** **threads** **. |
| **Metrics** | **Opp** **age**; **inbound** **item** **age**; **%** with **escalation** **path** **. |
| **Upward** | **Comms** **Director** **(primary**). ** |
| **Reviewers** | **Comms** **Director**; **Compliance** for **viral** **/ legal** **risk** **(advisory**). ** |

## Media Relations / Press (`media_relations_press`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Mention** **/ inquiry** **cycle** time; **discipline** on **on/off** **record**; **tight** **hand** to **Comms** **(plans**). ** |
| **Early fit** | **Media** **monitor** **non**-**stale**; **reporter** **intakes** **(email** **workflow** **/ intake**) **routed** **. |
| **Risk** | **Unreviewed** **quotes**; **bypassing** **Oppo+Compliance** on **attack** **lines** **. |
| **Training** | **Crisis** comms; **(party** **liaison** OOB**). ** |
| **Metrics** | **Mention** **ack** time; **(future)** **inquiry** **age** in **tickets** **. |
| **Upward** | **Comms** **Director**; **(CM** for **defining** **moments**). ** |
| **Reviewers** | **Comms** **Director**; **CM**; **Compliance** (advisory). ** |

## Volunteer Coordinator (`volunteer_coordinator`)

| Field | Content |
|-------|---------|
| **Core competencies** | **Funnel** from **`Submission` **/** **`VolunteerProfile` **;** **assigns** **turf** **(with** **Field** **Director**). ** |
| **Early fit** | **New** **volunteers** **/ week**; **intake** **age** **low**; **clean** **hand** to **county** **(tasks**). ** |
| **Risk** | **Data** **exports** to **unvetted** **volunteers**; **messaging** **at** **scale** without **Comms** **. |
| **Training** | **PII** **rules**; **hand** **to** **Comms**; **(future** **volunteer** **portal** **SOP**). ** |
| **Metrics** | **Intake** **age**; **no-show** after **“assigned”**; **(future** **NPS** **OOB**). ** |
| **Upward** | **Field** **Director** **(primary**); **(County** lead **/ organizer** for **lateral** **growth**). ** |
| **Reviewers** | **Field** **Director**; **CM** for **turf-**affecting** **(advisory**). ** |

## County/Regional Coordinator (`county_regional_coordinator`)

| Field | Content |
|-------|---------|
| **Core competencies** | **One** **geography** **;** **festival+event+task** **in** **that** **slice**; **escalation** to **Comms/Field** **leads** **(not** **hiding** **fires**). ** |
| **Early fit** | **Local** **tasks** + **festival** **readiness** **on** time; **county** **filter** used **right** **(workbench**). ** |
| **Risk** | **Solo** **voter** **/ list** **use** without **Data+Compliance** **(pattern** from **voter-**tied** **tasks** if **any**). ** |
| **Training** | **Turf SOP;** **event** **safety;** **list** **hygiene** **(with** **Data**). ** |
| **Metrics** | **Overdue** **in** **county**; **festival** **stuck** **in** **territory**; **(future** **#** local **signups**). ** |
| **Upward** | **Field** **Director** **(primary**); **(Field** **Organizer** **/ volunteer** for **lateral** **—** not **“up** **” in** **all** **orgs**). ** |
| **Reviewers** | **Field** **Director**; **Comms** **(advisory** if **messaging-**affecting**). ** |

## Field Organizer (`field_organizer`)

| Field | Content |
|-------|---------|
| **Core competencies** | Shifts and local execution; escalation to county lead (safety and data asks not hidden). |
| **Early fit** | Task close rate; on-time festival/event work when tasked. |
| **Risk** | Solo voter touches without SOP; outreach that should go through Comms. |
| **Training** | Turf + safety + script discipline; list use with Data/Compliance where applicable. |
| **Metrics** | No-show rate; task slip in turf; (future) shift fill rate. |
| **Upward** | County/Regional Coordinator (typical); lateral growth into volunteer with wider scope is org-specific. |
| **Reviewers** | County lead, then Field Director. |

## Remaining ROLE-1 positions (compact matrix)

The table below covers Data, Operations, entry, and platforms roles in one row each. Expand to full subsections when instrumentation lands.

| `PositionId` | Core competencies (short) | Early fit | Risk | Training (short) | Metrics (eventual) | Upward / reviewers |
|--------------|----------------------------|-----------|------|------------------|--------------------|--------------------|
| `data_manager` | Voter file rightness; segment definitions; **no** PII sprawl. | Ingest error → 0 trend; Comms/Field get segments on time. | Unvetted import to prod; ad hoc exports. | Dedupe, jurisdiction, export policy with Compliance. | Freshness, dedupe error rate, request SLA. | Up: ACM. Reviewers: CM, Compliance, Comms+Field (advisory). |
| `voter_insights_analytics` | Honest numbers; one definition of a metric. | Dashboards used in decisions, not as wallpaper. | Conflicting “truths” vs Data or Comms. | Stats literacy; Oppo+Comms on public stats. | Reconciliation incidents; turnaround on asks. | Up: Data Manager. Reviewers: Data Mgr, ACM, CM (advisory). |
| `opposition_research_lead` | Sourced, claim-safe packets; no solo ship. | Fast handoff to Content+Comms; no premature publish. | Unsourced or coordination-sensitive drops. | Oppo+legal+Comms release loop. | Turnaround; (future) claim audit rate. | Up: ACM / Comms (org-dependent). Reviewers: Comms, Compliance, CM. |
| `events_manager` | Program calendar integrity; event readiness. | Readiness green before deadlines; no orphan events. | Liability events without Comms+Compliance. | Readiness SOP, venue+legal, Field handoff. | Readiness %, last-minute fires. | Up: ACM. Reviewers: CM, Field+Comms (advisory), Compliance. |
| `scheduler_calendar_manager` | No silent conflicts; principal time sacred. | Few collision incidents; comms+event holds respected. | “Surprise” send **vs** event same day. | Calendar+comms **windows**; CM time rules. | Collision count, hold violations. | Up: ACM. Reviewers: CM, Comms Director. |
| `task_workflow_manager` | No orphan work; right object for right problem. | Intake+task **throughput;** no duplicate work objects. | Creating noise tasks; hiding real escalations. | Intake SOP, template tasks, de-dupe rules. | Orphan intakes, duplicate tasks, time-to-owner. | Up: ACM. Reviewers: ACM, CM. |
| `intern_general` | **Supervised** **execution;** no unsupervised public voice. | Supervised **tasks** **done;** no sensitive queues touched without pairing. | **Solo** on voter/export/comms. | SOP+shadowing+PII. | Error rate, rework by manager. | Up: department lead, ACM. Reviewers: that lead + CM for seat moves. |
| `volunteer_general` | Reliability on **assigned** work only; **escalation** on **PII/ safety.** | Task/shift **completion**; follows SOP. | Voter+comms+data **without** **training. ** | SOP+**field**+**safety+** (future portal). | No-show, incident flags (future). | Up: Coordinator / County / Organizer. Reviewers: Field line + CM (advisory). |
| `platforms_integrations` | Keys and webhooks healthy; no “shadow IT” sends. | Low webhook/SMTP failure rates; no silent key drift. | New integration without Data+Compliance+Comms review. | Integration security; vendor+data flow. | **Credential** + delivery health metrics. | Up: ACM or Comms (org). Reviewers: CM, Compliance, Finance (vendors). |

---

*Last updated: Packet TALENT-1.*
