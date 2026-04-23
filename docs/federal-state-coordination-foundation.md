# Federal / state coordination — foundation (governance) (RedDirt)

**Purpose:** A **narrow,** **governance-oriented** place to describe **how** the **system** and **org** should **treat** **coordination-sensitive** and **federal-** **vs**-**state** **resource** **mixing** **—** without **this** **document** or **any** **code** in **this** **repo** being **legal** **advice** **, **and** **without** **automated** **legal** **conclusions** **. **

**Cross-ref:** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`budget-and-spend-governance-foundation.md`](./budget-and-spend-governance-foundation.md) · FUND-1 (donor / federal public data) · `HumanGovernanceBoundary` in `src/lib/campaign-engine/ai-brain.ts` · **ingest** maps for jurisdiction-specific rules (ingest, do not improvise) **. **

---

## 1. Why this is a high-risk area

- **Mistakes** in **attribution,** **disclaimers,** or **allocations** can **attract** **enforcement,** **press,** and **reputational** **harm** **—** **independent** of **this** **software** **. **
- **The** **model** **is** **not** **a** **lawyer,** and **heuristics** **are** not **filing** **automation** **(none** in **this** **repo) **. **

---

## 2. System posture (default)

- **Flag** and **queue** for **review** any **automation,** **bulk** **comms,** or **spend** **allocations** that **touch** **shared** **costs,** **shared** **messaging,** or **federal-** **vs**-**nonfederal** **mixing,** when **the** **product** **detects** **such** **patterns** **(future** **wiring) **. **
- **Require** **human** / **compliance** **sign-off** **before** **“** **go** **”** on **any** **automation** that **moves** **money,** **sends** **at** **scale,** or **publishes** **paid** **disclaimers** **in** this **sensitive** **class** **(queue-first** and **E-1** **norms) **. **
- **Document** **assumptions** and **allocation** **splits** in **a** **human-owned** **artifact** (memo, **spreadsheet,** or **filing) **; **the** **app** can **link** to **`ComplianceDocument`** **rows** (COMP-2) **. **

---

## 3. Risk categories (examples, not exhaustive)

- **Shared costs** — one vendor or **one** **event** **supporting** **multiple** **entities** or **pools** **. **
- **Shared communications** — **coordinated** **messaging** **(conceptual) **. **
- **Independent** **expenditure** **adjacency** — **earmarks,** **transfers,** or **messaging** **that** could **implicate** **IE** / **coordination** **(policy**-**dependent) **. **
- **Disclaimers** / **reporting** **overlap** — **same** **content** on **federal-** and **state-**facing **assets** **. **
- **Federal** / **nonfederal** **resource** **mixing** — **staff** **time,** **list** **use,** **and** **overhead** **(allocation**-**heavy) **. **

---

## 4. What the system should do (when built)

- **Detect** **candidates** for **sensitivity** (tags, form fields, **or** **future** **rules) **; **not** **final** **determinations** **. **
- **Require** **tagged** **review** in **a** **queue** **(open** work / **inbox** **patterns) **. **
- **Preserve** **provenance** (who **uploaded,** who **approved,** which **policy** **version) **. **
- **Avoid** **silent** **automation** — **no** **auto**-**file,** no **auto**-**“** **cleared** **”** **for** this **class** **(see** **AI** **posture** in **COMP**-**1) **. **

---

## 5. What must wait for human / legal review

- **Regulatory** **interpretation,** **allocation** **formulas** **suitable** for **filing,** and **“** **can** **we** **do** **this** **plan** **”** **. **
- **Enforcement** **response** and **amendment** **strategy** **. **
- **Any** **conclusion** that **a** **given** **act** is **permissible** **. **

---

*Last updated: Packet federal-state (with POLICY-1 + COMP-2 + BUDGET-1 foundation run). This document is not legal advice.*
