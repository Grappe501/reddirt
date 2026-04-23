# Donor research and enrichment — foundation (FUND-1) (RedDirt)

**Packet FUND-1 (architecture only).** Defines how **external** contribution **history** and **internal** people **data** can **eventually** be **matched**, **scored**, and **reviewed** **before** a prospect hits a **strategic** or **call** list. **No** **live** OpenFEC **/** **AR** state **wiring** is claimed as **implemented** in this packet unless **already** in repo (see code search before production use).

**Cross-ref:** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) · [`workbench-job-definitions.md`](./workbench-job-definitions.md) (Finance Director) · `src/lib/campaign-engine/fundraising.ts` (`DonorResearchSignal`, etc.)

---

## 1. North star

**Donor research** is: **(a)** **matching** internal people or prospect rows to **external** **contribution** **records** where **law** and **licensing** allow; **(b)** **ranking** **likely** **alignment** and **strategic** **value**; **(c)** **surfacing** **prospects** **already** in the **universe** of **emails/phones/addresses** the campaign is allowed to use **(consent** **and** **policy** still **apply) **. It is **not** a **guarantee** of **donation** on **a** **schedule**; it is a **decision** **support** **layer** for **lists** and **stewardship** **(human** **commit** **on** **high**-**leverage** **moves) **.

---

## 2. Research model (conceptual stages)

1. **Internal** **identity** — `User` / `VolunteerProfile` / **future** `Donor` **or** `Prospect` **row**; **name**, **geography** **hints**, **emails/phones** where stored (e.g. `User.phone` — optional, **unverified** in **FUND-1**).
2. **External** **records** — **Committee**-level **receipts** and **line**-item **contribution** data from **federal** **(FEC** **/ OpenFEC** **as** a **public** **federal** **source) **; **Arkansas** or **other** **state** **ethics** **/ disclosure** **feeds** **as** a **planned** **track** **—** **exact** **file** **formats**, **endpoints**, and **compliance** **must** be **confirmed** **with** **counsel** **and** **before** **ingest** **(not** **asserted** **here) **.
3. **Normalization** / **dedupe** — **name** + **location** + **date** **windows**; **no** **single** “**truth**” **key** in **FUND-1** **schema** **.**
4. **Matching** + **confidence** — **fuzzy** **name**, **spouse/employer** **(when** **in** **external** **data) **, **geography** **overlap**; **always** allow **low**-**confidence** **bucket** **.**
5. **Scoring** / **ranking** — **Strategic** **signals** (see §4); **weights** are **governance**-**configurable** **in** **a** **future** **product** **, not** **hard**-**coded** **agent** **secrets** **.**
6. **Follow**-**up** **path** — **stewardship** **task** **or** **inclusion** in **a** **call** **sheet** **after** **human** **accept**; **link** to **open** work **(ASSIGN-1) ** and **TALENT-1** **stewardship** **narrative** **. **

---

## 3. External data sources (grounded, honest)

| Source (example) | Role | Repo status in FUND-1 |
|------------------|------|------------------------|
| **FEC** **(OpenFEC** **or** **bulk** **files) ** | **Federal** **contributions** to **candidates** **and** **committees** **(public** **data) ** | **Planned** **ingest** **—** **not** **a** **live** **client** in **`fundraising.ts` **. **No** **assertion** of **red**-**Dirt**-**wide** **OpenFEC** **wiring** **in** this **packet** **.**
| **Arkansas** / **state** **ethics** | **State**-**level** **reporting** **(when** **applicable) ** | **Treated** **as** a **separate** **integration** **project**; **jurisdiction** **-** and **time**-**period** **-** **specific** **. **|
| **Proprietary** **vendors** | **Wealth** **screening** **(optional) ** | **Not** in **FUND-1**; **if** **added**, **contract** and **data**-**residency** **govern** **. ** |

---

## 4. Strategic signals (examples)

- Donated to **aligned** **statewide** or **federal** **candidates** **(similar** **ideology) ** in **a** **defined** **window** **.**
- **Recency** and **repetition** of **gifts** **.**
- **Geography** **(same** **county** / **region** as **campaign** **footprint) **.**
- **Relationship** **already** in **database** **(volunteer** **,** **event** **RSVP) **.**
- **Major**-**donor** **tiers** **(thresholds** **set** by **policy) **.**
- **Lapsed** **or** **slipping** **patterns** for **re**-**engagement** **(when** **history** **exists) **.**
- **Overlap** with **opposition**-**adjacent** **or** **banned** **committees** **(risk** **flag) **, **not** **auto**-**exclude** **without** **human** **review** where **sensitive** **. **

**Enum**-**style** **hooks:** `DonorResearchSignal` in `fundraising.ts` (types only).

---

## 5. Matching / risk (explicit)

- **Duplicate** **names** **,** **households** **,** **and** **DBA** **variations** **—** high **ambiguity** **.**
- **Stale** **addresses** and **old** **phones** **(see** `contactability-and-calltime-precheck-foundation.md` **) **.**
- **Confidence** must be **exposed** to **ops**; **low**-**conf** must **not** **auto**-**export** to **principals** **lists** by **default** **.**
- **Human** **review** before **high**-**value** **or** **legally** **sensitive** **outreach** **(bundling** **,** **reporting** **,** **solicitation** **to** **reg** **-** **restricted** **audiences) **. **

---

## 6. Governance

- All **suggested** **lists** and **rank** **order** that **affect** **money**-**moving** **or** **reportable** **events** are **auditable**; **overrides** **and** **reasons** **align** with **ALIGN-1** **.**
- **No** **“** **AI** **decided** **this** **donor** **is** **safe**” **as** a **compliance** **proxy** **. **
- **PII** **and** **public**-**data** **derivatives** follow **voter** **/ PII** **policies** **in** the **wider** **RedDirt** **governance** **. **

*Last updated: Packet FUND-1.*
