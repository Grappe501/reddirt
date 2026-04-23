# Talent recommendation flow (RedDirt)

**Packet TALENT-1.** Describes how **advisory** talent and training **recommendations** are **generated**, **routed** on the org tree, **surfaced** to humans, and **audited**—**without** auto-promotion or permissions. Pairs with [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) and [`position-development-matrix.md`](./position-development-matrix.md).

---

## 1. Conceptual generation

1. **Ingest** structured **signals** (task outcomes, time-to-action, queue triage fields, comms error involvement, training completion when it exists). See foundation §3.
2. **Apply** **position**-specific **rubric** from the development matrix (competencies, risk signals, metrics).
3. **Produce** a **draft recommendation**: type (`TalentRecommendationType` in `talent.ts`), target `userId` (or cohort), optional target `positionId` *suggested* for the future, `reasons[]` (human-readable), `evidence[]` (pointers: `{ domain, objectType, id, field? }`—no PII in free text if avoidable).
4. **Score** (optional, future): if numeric confidence exists, it is **explanatory** and **subordinate** to `reasons[]`—**never** the only field shown to a manager.

**Models:** Heuristic v1, LLM for natural-language *summaries* of reasons only with **same** provenance as E-2 email workflow (`modelId`, `version`, `timestamp`).

---

## 2. Who receives them

| Recommendation class | Default recipient (position / person) |
|----------------------|--------------------------------------|
| Training / micro-skill | Direct supervisor position: e.g. Volunteer Coordinator, County/Regional Coordinator, Email/Comms Manager. |
| “Shadow” or stretch assignment | Same + optional copy to parent for awareness. |
| Not ready for sensitive work | Comms or Field **director** + **Compliance** for comms/sends; CM if cross-cutting. |
| Upward / promotion-**like** | **Parent** **position** in tree + **always** **Campaign Manager** for cross-department seat changes. |
| Discipline-**adjacent** (urgent risk) | **Human** only—Compliance, CM, Field Director as appropriate; **not** a bot DM to the subject without human gate. |

*Today all admin users see all workbenches; future: restrict **delivery** by `PositionId` + seating.*

---

## 3. How they move up the hierarchy

- **L1 — Local:** Coordinator/manager gets **informational** feed (digest or low-priority panel).
- **L2 — Parent:** Field Director, Comms Director, or ACM see **escalation**-class recommendations (advancement, trust expansion, “not ready”).
- **L3 — Root:** CM sees **cross-department** or **jurisdiction**-sensitive suggestions (e.g. move to County Coordinator from Volunteer general).

**No automatic “routing” in code in TALENT-1**—this is the **intended** product behavior when assignment + position seating exist.

---

## 4. Informational vs prominent

| When | Surface |
|------|--------|
| **Informational** | Training tip after a single missed SLAs; “consider module X” in a sidebar. No blocking modal. |
| **Prominent** | Repeated miss on a **sensitive** queue; recommendation touches **voter** **data** or **send** **authority**; “ready for advanced responsibility”—requires **inbox** row or **dashboard** **card** with **ack** **required** (ack ≠ approve promotion). |
| **Suppress / delay** | Noisy heuristics in early campaign; use **snooze** + **dismiss** with reason (logged). |

---

## 5. Provenance and explanation

Every machine-assisted recommendation should carry at minimum:

- `recommendationId` (UUID), `type`, `targetUserId`, `createdAt`
- `reasons: string[]` (short, for managers)
- `evidence: { source: string, ref: string }[]` (e.g. `email_workflow:uuid`, `task:uuid`)
- `model?: { id: string, version: string }`, `promptVersion?: string` if LLM
- `status: draft | active | acknowledged | dismissed | expired`

**Human** actions log: `acknowledgedByUserId`, `dismissedByUserId`, `dismissalReason?`, `notes?`.

---

## 6. What to log and audit (for later implementation)

- **Create** + **state transitions** on recommendations (append-only or event log).
- **No** **deletion** of **historical** **suggestions**—**soft** expire only.
- Access to sensitive recommendations (discipline-adjacent, risk flags) in a separate stream with a higher bar when RBAC exists.

---

## 7. Examples (illustrative)

**A) Volunteer shows organizer aptitude**  
- *Signals:* High task completion in county; self-initiated `WorkflowIntake` for local events; low error rate on festival suggests.  
- *Flow:* **Local** to Volunteer Coordinator; **L2** optional to Field Director; **L3** CM if suggesting **County/Regional Coordinator** path.  
- *Surface:* Informational + “Request CM review” button—not auto seat change.

**B) Intern ready for more responsibility**  
- *Signals:* Consistent on-time `CampaignTask` completion; training modules completed; no sensitive-queue errors.  
- *Flow:* ACM + relevant department lead (e.g. Content Manager if in content).  
- *Surface:* Informational; promotion remains human.

**C) Comms volunteer not ready for escalation-sensitive work**  
- *Signals:* Repeated overrides needed on `EmailWorkflowItem` triage; `CommunicationSend` error involvement when assigned.  
- *Flow:* Email/Comms Manager + Comms Director; **Compliance** copy on **messaging** risk. **No** new send permissions.  
- *Surface:* Prominent for managers; **not** a public label on the user.

**D) High-reliability volunteer → targeted training**  
- *Signals:* Reliability + initiative; matrix suggests stretch to Field Organizer.  
- *Flow:* County/Regional Coordinator first; Field Director for stretch assignment.  
- *Surface:* Training **track** suggestion + **optional** “shadow” task template—advisory.

---

*Last updated: Packet TALENT-1.*
