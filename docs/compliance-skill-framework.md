# Compliance — skill framework for the agent (COMP-1) (RedDirt)

**Companion** to the **governance** **rail** doc. Specifies **compliance** **as** a **first-class** **skill** **lens** **(not** a **separate** **app) **, **grounded** in **HumanGovernanceBoundary**-**style** **norms** **. **

**Cross-ref:** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · `src/lib/campaign-engine/compliance.ts` · `src/lib/campaign-engine/ai-brain.ts` · `AgentSkillDomain.COMPLIANCE_GOVERNANCE` in `skills.ts`

---

## Skill table

| Skill | What the agent should know | What it should do | What it should flag | Must never imply authority over |
|-------|---------------------------|-------------------|------------------------|--------------------------------|
| **Rule** **awareness** | **Ingested** **SOPs** and **cited** **reg** **(not** **halucinated) ** | **Point** to **relevant** **passages**; **gaps** if **RAG** **empty** | **Actions** with **no** **policy** **anchor** in **ingest** | **Binding** **legal** **opinion** **;** **filing** **eligibility** **.**
| **Deadline** **awareness** | **Filing** **dates** in **RAG** **(versioned) ** | **Upcoming** **narration,** **not** **calendar** **writes** in **COMP-1** | **Unassigned** **owner** for **a** **due** **item** (future **queue) ** | **“** **On** **file** **with** **agency** **”** **.**
| **Paperwork** **prep** **support** | **Field** **list** for **a** **form** **(when** **ingested) ** | **Draft** **line**-**item** **suggestions;** **mark** **“** **draft** **) ** | **Conflicting** **with** **math** in **receipts** | **E**-**filing** **submissions** **.**
| **Exception** **spotting** | **Thresholds** in **SOPs** | **Surface** **outliers** in **import** **batches** | **Vendors** or **amounts** **needing** **second** **human** | **Waiver** of **rule** **.**
| **Documentation** **completeness** | **Checklist** **RAG** | **X** **/ **check** on **per**-**form** **fields** | **Missing** **receipt** **links** | **“** **Audit**-**ready** **”** **.**
| **Channel** **governance** | **Opt-in,** **DNC,** **disclaimer** **rules** (ingested) | **Narrate** **risk** on **a** **draft** **message** / **list** | **Message** with **forbidden** **phrasing** | **Sends** **/ **dials** **.**
| **Escalation** **sensitivity** | **Who** **signs;** **when** to **include** **counsel** | **“** **Recommend** **human** A** **) **, **not** B** **. ** | **Touched** **governance** **boundary** in **`ai-brain` **. **| **Veto** **on** **behalf** of **compliance** **.**
| **Audit** / **provenance** **literacy** | **ALIGN-1,** **E-2** **metadata** | **Point** to **provenance** **source**; **suggest** **override** **reasons** (non**-**binding) | **Unlogged** **changes** **on** **sensitive** **objects** (when **data** **exists) ** | **“** **Audit**-**signed** **off** **) **.**
| **Recommend,** **don’t** **certify** | **Entire** **posture** | **Every** **compliance** **output** is **advisory** **;** use **phrasing** in **RAG** **(“** **draft,** **not** **filed** **) ** | N/A | **“** **Compliant** **) **, **“** **approved** **) **, **“** **legal** **) ** as **a** **single**-**model** **judgment** **. **

*Last updated: Packet COMP-1.*
