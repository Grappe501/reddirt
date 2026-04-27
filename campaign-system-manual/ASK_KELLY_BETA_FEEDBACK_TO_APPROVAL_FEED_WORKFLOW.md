# Ask Kelly — beta feedback to admin/candidate approval feed workflow (Manual Pass 5H)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Workflow** **doctrine** **(manual)** for **beta** **(and,** where applicable,** **public) **intake** **—** **not** **a** **shipped** **queue,** not **2A** **replaced,** not **GOTV** **persuasion** **(see** `SEGMENTED_MESSAGE_...` **§**22,** `ASK_KELLY_SUGGESTION_BOX_...` **).**  

**Ref:** `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` (4B) · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `WORKBENCH_OPERATOR_RUNBOOK.md` · `MANUAL_INFORMATION_REQUESTS_...` **§**45

---

## 1. What the beta user can submit

- Question (clarify scope — may route to `ASK_KELLY_EXPLAIN_WHY_...` **content) **. **  
- Confusion (needs better UI copy, not a blame thread).  
- Suggestion (must meet specificity rules in `ASK_KELLY_SUGGESTION_...` **). **  
- **Bug** / broken behavior (routes to product/engineering **queue,** not **a** **public** **post** **mortem) **. **  
- **Copy** edit.  
- **Missing** content.  
- “**Why**” **question** (see explain-**why** guide).  

---

## 2. What the system (when built) should create

| Artifact | Notes |
|----------|--------|
| **Feedback** **item** | **Atomic** **row;** **link** **to** **page** **+ ** **type** **. ** |
| **Suggested** **packet** **type** | e.g. **static** **wording,** **UX** **tweak,** **policy,** **legal** **—** from **`CANDIDATE_TO_ADMIN_...` ** patterns **. ** |
| **Specificity** **score** | **Qual** **0**–**3** **; ** “** need** **more** **detail** **” **at **0** **. ** |
| **Duplicate** **match** | **Merge** or **link** if **same** **page** **+ ** **very** **similar** **text** **. ** |
| **Risk** **score** | **Flags** for **$** **, ** **legal,** **GOTV,** **contrast,** **data** **(see** **suggestion** **rules) **. ** |
| **Affected** **page** **/ ** **feature** | **Human-****readable** **label** **. ** |
| **Routed** **owner** | **From** **matrix** + **2A** **(see** **§**3** **). ** |

---

## 3. Admin / candidate approval feed — routing (conceptual)

- **Candidate** **review** **needed?** **(voice,** “**I** **” **, **high**-**impact) **. **  
- **Admin** **only?** (typos, **low**-**impact) **. **  
- **Comms?** (tone,** **FAQ,** **public** **facing) **. **  
- **Counsel?** (legal,** **contrast) **. **  
- **Product** **/ ** **engineering?** (bugs,** **lock** **logic) **. **  
- **Park** **for** **later?** (good** **idea,** **not** **now) **. **

Per **`APPROVAL_AUTHORITY_MATRIX` **; **not** a **bypass** of **LQA** **/ ** **MCE** **for** **ship** **copy** **. **

---

## 4. Statuses

- **New**  
- **Needs** **More** **Detail**  
- **Routed**  
- **Candidate** **Review**  
- **Admin** **Approved** (internal step — not “approved for public” until MCE+LQA as needed)  
- **Comms** **Review**  
- **Counsel** **Review**  
- **Product** **Backlog**  
- **Implemented**  
- **Declined** (with** **governance,** not** **a** **public** **shame) **. **  
- **Parked**  

**No** **promise** to **move** every **item** to **Implemented** **. **

---

## 5. Beta user reply templates (public-safe tone)

- **Received:** *Thanks — we captured: [short summary]. The team will review; we can’t guarantee every change, but this helps. *  
- **Need** **more** **detail:** *Thanks — to route this, we need: which page, exact line or button, and what you’d try instead* **(see** suggestion **box) **. **  
- **Implemented:** *We made a change based on feedback like yours; refresh [page] —* **only** if **true,** MCE+**as** **needed** **. **  
- **Not** **using** **now:** *We logged this; we’re not moving on it in this period because [high-level, non-insulting reason]* **(no** **blame) **. **  
- **Parked** **for** **later:** *Good idea — we’re parking it in the backlog for [season/milestone] — not a commitment to date* **(unless** **owner** **sets** one) **. **

**Do** **not** **argue** in **the** open **with** a **suggestion** **(see** suggestion **box** **“** **no** **public** **argument** **loop** **” **) **. **

---

**Last updated:** 2026-04-28 (Pass 5H)
