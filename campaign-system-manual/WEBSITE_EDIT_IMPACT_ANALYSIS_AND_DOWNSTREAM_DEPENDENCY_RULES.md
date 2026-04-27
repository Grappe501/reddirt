# Website edit impact analysis and downstream dependency rules (Manual Pass 5G)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Triage** **governance** for **proposed** **public** or **A/B** text **deltas** **—** not **a** **shipped** **impact** **engine,** and **not** a **bypass** of **MCE/NDE,** **LQA,** **treasurer,** or **counsel** (`playbooks/APPROVAL_AUTHORITY_MATRIX.md`, `playbooks/ESCALATION_PATHS.md`).

**Ref:** `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md` · `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**44

---

## 1. **Impact** **categories** **(triage) **

| **Level** | **Examples** (non-exhaustive) | **Not** a **bypass** of **5D+**5F+**3H **+ **5B** |
|------------|-------------------------------|----------------------------------|
| **No** **downstream** | **Typos,** **style,** **tone,** **sentence** **simplification,** **“** **sounds** **like** me**”** with **no** **new** **factual,** **legal,** **$** **, ** **or** **contrast** **(see** `CANDIDATE_EDITING_...` **) **. ** |
| **Low** | **CTA,** **page** **framing,** **values** **phrasing,** **event** **intro** **(non**-**factual) **, **if** not **a** **new** **schedule** **claim **(see** 5D **OIS) **. ** |
| **Medium** | **FAQ,** **policy** **nuance,** **biography,** **county** **narrative,** **volunteer** **ask,** any **line** that **may** **sync** to **MCE+** **(see** 5B **) **. ** |
| **High** | **Public** **promise,** **election/security** **or** **fraud,** **legal/statute,** **opponent,** **$,** **targeting,** **GOTV,** **VFR,** **paid** **media** **(see** `SEGMENTED_` **,** **2A) **. ** |

---

## 2. **Required** **downstream** **checks** **(by** **level,** **not** **all** **at** **once) **

| **Surface** | **When** **to** **touch** it |
|------------|---------------------------|
| **Website** (static) | **Almost** **all** **non**-**trivial** **deltas,** with **LQA+publish,** not **a** **chat**-**driven** **raw** **HTML** **(see** 5B **). ** |
| **Ask** **Kelly** / **A-B** | **If** the **line** is **a** **candidate**-**facing** **Q&A** or **A/B**-**touched** **(5F) **, **+** `CONTINUOUS_...` **. ** |
| **FAQ** | **5D** **+** **MI** **§**41 **sources;** **not** a **new** number **(see** 5D **) **. ** |
| **MCE/NDE** | **If** the **line** is **a** **message** or **a** **reusable** **block** **(see** 5B **) **. ** |
| **Talking** **points** | **If** **MCE+comms** **ties** **static** to **TTP** **(see** `KELLY_` **) **. ** |
| **Field** **scripts** | **If** a **GOTV** **or** **a** **canvass** **line** **(see** playbooks) **, ** not **VFR** **bypass** **(5C) **. ** |
| **Candidate** **dashboard** / **4B** | **If** a **lever,** **promise,** or **strategy** **assumption** **(see** 4B **) **. ** |
| **Budget** **/ ** **planning** | **R2+;** if **$** or **a** **resource** **(see** 3H **) **. ** |
| **Compliance** **/ ** **counsel** | **Fraud,** **statute,** **contrast,** **press**-**bait,** `ESCALATION_PATHS` **. ** |
| **Workbench** **/ ** **`WorkflowIntake`** | **If** an **op** is **now** **a** **known** **gap** (2A), **not** a **GOTV** **cut** from **a** **wizard** **(see** 5C **) **. ** |

---

## 3. **Illustrative** **scenarios** **(no** **PII,** not **a** **claim** the **edits** **are** **real) **

| **Candidate** **change** (example) | **Triage** | **Downstream** |
|------------------------------------|------------|----------------|
| **Tighten** a **5D**-**SOS** / **EPI** **/ ** **SBEC** **sentence** | **High** | **5D** + **MCE+comms+** **counsel** on **a** **fraud** **word;** **not** a **paraphrase** of **a** **PDF** **(see** 5D **) **. ** |
| **Adds** **GOP** **/ ** **listening** **/ ** **civic**-**room** **language** (no** ****new** **date) **| **Med**-**H** with **MCE+** if **a** **package**; **5E** **§**6 **(no** **pandering) ** | **MCE+** **+** **static+** **maybe** **Ask** **Kelly** **(B** not **A) **(see** 5F) **, ****not** **a** **timetable** **invented** **(see** 5D **) **. ** |
| **Changes** a **“**get** **involved**”** **/ ** **vol** **ask** | **Med** (no** **GOTV** **cut) **, **+** **5C** | **LQA+** **static+** **Pathway,** not **VFR** in **a** **wizard,** not **GOTV** in **a** **chat** **(see** 5C **) **. ** |
| **Adds** a **public** **“**I** **will**”** **(resource) **| **High** | **4B+** **treasurer+** **CM+** `APPROVAL_AUTHORITY` **(see** 3H) **, ****not** **a** **one**-**line** **ship** to **MCE** **(see** 5B **) **. ** |
| **Changes** a **$**-**adjacent** **/ ** **fundraising** **or** **a** **COH** **/ ** **fee** **claim** | **High** | **Treasurer+** **3H+** **no** **numbers** in **a** **non**-**R2** **summary** **(see** 3H) **, ****not** **a** **voter** **facing** **$** in **a** **wizard,** if **a** **public** **$** is **TBD,** say **TBD,** not **a** **fixture** **(see** `SYSTEM_READINESS` **) **. ** |
| **Reframes** an **upcoming** **/ ** **past** **event,** or **a** **county** **(factual) **| **Med**-**H** with **OIS** - **honest,** not **a** **ghost,** (see 5D **/ **3D–3F) ** | **OIS+GCal+** **static+** **maybe** **TTP;** if **a** **new** **county** **“** **fact,**”** not **a** **fake** **(see** 3D **) **. ** |

---

**Last** **updated:** 2026-04-28 (Pass 5G)
