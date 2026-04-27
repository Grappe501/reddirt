# Thank-you card and appreciation workflow (Manual Pass 5I)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **SOP** **/ ** **governance** **for** **gratitude** **in** **operations,** **starting** **with** the **candidate** **and** **allowing** **delegation** **—** **not** **a** **shipped** **automation,** **not** **auto**-**send** **for** **sensitive** **relationships** **or** **compliance**-**gated** **donor** **messages** **without** **treasurer+** **/ ** **MCE** **(see** `playbooks/APPROVAL_AUTHORITY_MATRIX` **, **`MANUAL_INFORMATION_...` **§**46** **, **3H) **. **

**Ref:** `CM_DAILY_AND_WEEKLY_OPERATING_SYSTEM.md` · `CANDIDATE_DASHBOARD_AND_DECISION_RUNBOOK.md` · `playbooks/TASK_TEMPLATE_INDEX.md` · `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` (4B) · `ASK_KELLY_LAUNCH_PRIORITY_...` (sequencing)

**Product honesty:** **This** **pass** does **not** create **a** **thank**-**you** **queue** in **code;** it **creates** **RACI** **and** **triggers** **for** a **future** **build** **or** **emulated** **with** `CampaignTask` **. **

---

## 1. Why appreciation matters

- **Retention,** **morale,** **dignity** for **volunteers** and **donors;** **not** a **favor**-**extract. ** ** **  
- **Relational** **organizing,** **donor** **/ ** **event** **/ ** **beta** **/ ** **county** **stewardship** **(see** 3D/3F/3G) **. ** **  
- **Event** follow-up,** **GOP** **/ ** **civic** **listening** **—** **5D/5E** **tone,** not **a** **flame. ** ** **  
- **“** **Motion** **creates** **emotion****”** **(creative** **direction** **5D) ** **—** **brief** **/ ** **authentic** **thanks** **fit** the **frame** **. **

---

## 2. Who can trigger a thank-you

**Candidate,** **CM,** **VCoord,** **county** **coordinator,** **fundraising** **lead,** **event** **host,** **P5** **leader,** *plus* **delegated** **drafter** with **MCE+** for **sensitive** **(MI) ** **. **

---

## 3. Candidate-first doctrine

- **Candidate** **can** **write** **personally. ** ** ** **  
- **Can** **delegate** **drafting** **(comms** **/ ** **advance) ** **with** **MCE+** on **sensitive. ** ** ** ** **  
- **Can** **approve** **batches** **(batch** **owner** in **RACI) **. ** ** ** **  
- **Can** **mark** **“** **personal** **note** **needed****”** **—** not **a** **generic** **mail**-**merge. ** ** ** **

---

## 4. Thank-you types (pick one path)

- **Handwritten** **card,** **email,** **SMS,** **phone,** public **shout**-**out** **(consent) **, **donor,** **volunteer,** **event** **host,** **beta,** **county** **/ ** **civic,** **GOP** **/ ** **cross**-**party** **—** **MCE+** **/ ** **treasury** **/ ** **counsel** as **governed. **

---

## 5. Workflow (design)

1. **Trigger** **event** (see **§**6) **. ** ** **  
2. **Create** **`CampaignTask` **or **`WorkflowIntake` **(thank-you type) ** **. ** ** **  
3. **Owner** **assigned** (candidate,** **MCE,** **VC) **. ** ** ** **  
4. **Draft** **(delegate** **ok) **. ** ** ** ** **  
5. **Candidate** **personalizes** **or** **one**-**tap** **approves** **batch** **(where** **safe) **. ** ** ** ** ** **  
6. **Send** **per** **channel** **(no** **auto**-**to**-**sensitive) **. ** ** ** ** ** **  
7. **Log** **completion** **(audit) **. ** ** ** ** ** **  
8. **Follow**-**up** if **stale** **(SLA) **. **

---

## 6. Triggers (non-exhaustive)

**Donation,** **first** **vol** **action,** **milestone,** **attendance,** **hosted** event,** **useful** **suggestion,** **website** **review** **help,** **beta** **feedback,** **county** **intro,** **GOP** **/ ** **civic,** **press** help — **RACI** each **(no** **PII** **in** **a** **public** **log) **. **

---

## 7. Approval

- **Routine** **thanks** **can** **delegate** **(MI) **. ** ** ** ** **  
- **Donor** **thanks** = **compliance+** **treasurer+** as **governed. ** ** ** ** ** **  
- **Public** **shout**-**out** = **consent+** **MCE. ** ** ** ** ** **  
- **Sensitive** **private** **notes** **=** not **a** **brief**ing **gossip** **(see** `ESCALATION_PATHS` **if** **escalation) **. **

---

## 8. Ask Kelly integration (future; no “AI” public label)

- *Who* *should* *we* *thank* *today?* (aggregates+** **RACI,** not **VFR) **. ** ** ** ** **  
- *Draft* *a* *host* *thank-you* *—* *then* *MCE+.* ** ** ** ** ** ** **  
- *Overdue* *thank* *tasks* **(counts) **. ** ** ** ** ** ** **  
- *Mark* *candidate* *personal* *needed* **(flag) **. **

---

## 9. Sample template stubs (MCE+ — no PII in repo)

* **Volunteer** **first** *action* **: ** *“Thank you for taking your first step with us — you’re the kind of person Arkansas can count on.”* ** ** ** ** ** **  
* **Event** *host* **: ** *“Your hospitality made a hard room feel safe. We see you.”* ** ** ** ** ** ** **  
* **Beta** **: ** *“You helped us test with integrity — the campaign is better because of it.”* ** ** ** ** ** ** **

**Do** **not** **commit** to **a** **draft** in **a** **public** **surface** as **MCE**-**signed** without **LQA+owner** **. **

---

**Last updated:** 2026-04-28 (Pass 5I)
