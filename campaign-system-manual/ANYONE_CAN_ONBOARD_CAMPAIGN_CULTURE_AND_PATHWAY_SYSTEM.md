# Anyone can onboard — campaign culture and pathway system (Manual Pass 5L)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine** for **invitation,** **welcome,** **and** **relational** **onboarding** **—** **not** a **shipped** **product,** **not** a **bypass** of **training,** **RACI,** or **data** **policy** **(see** `playbooks/APPROVAL_AUTHORITY_MATRIX.md` **,** `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` **, **`ROLE_BASED_UNLOCK_LADDERS.md` **). **

**Ref:** `WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM.md` · `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md` · `ADVANCE_TASK_BUY_IN_AND_ESCALATION_LADDER_SYSTEM.md` · `VOLUNTEER_RETENTION_ENGAGEMENT_AND_LOW_TURNOVER_SYSTEM.md` · `workflows/POWER_OF_5_ONBOARDING.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**49

**Product honesty:** This pass **adds** **manual** **doctrine** only. It **does** **not** assert that a full **“**anyone**-**can**-**onboard**”** flow exists in app code, or that every volunteer can place others without staff rules.

---

## 1. Culture doctrine

- **Everyone** is **encouraged** to **invite,** **welcome,** and **help** **move** **someone** **closer** to **meaningful** **participation** in **the** **campaign** **(relational** first**).**  
- **“** **Anyone** **can** **onboard** **”** does **not** mean **anyone** **grants** **sensitive** **access** **(VFR,** **exports,** **finance,** **compliance**-**class** **tools,** **GOTV** **levers) **. **That** **remains** **RACI**-**gated** **per** **matrix** **and** **role** **readiness** **(Pass** **4,** **5C** **).**  
- **Speed** is **a** **virtue** **when** it **serves** **clarity** **and** **care** **—** the **operating** **phrase** is **: ** **fast** **and** **strong,** **but** **relational** **and** **sustainable** **(no** **hero**-**only** **sprints,** **no** **shame** **for** **rest** **;** see **`VOLUNTEER_RETENTION_...` **). **

---

## 2. Onboarding ladder (intended path)

1. **Invite** — **share** **a** **governed** **link,** **event,** **or** **personal** **ask** **(consent**-**aware) **. **  
2. **Welcome** — **acknowledge** **arrival,** **set** **tone,** **name** **a** **next** **step** **. **  
3. **Collect** **interest** — **structured** **intake** **(`POST` ** `/api/forms` ** → **`WorkflowIntake` ** when **built) **, **not** **scraping** **or** **shadow** **rosters** **. **  
4. **Route** **to** **starter** **path** **—** **progressive** **onboarding,** **first** **safe** **tasks** **(5C** **). **  
5. **Connect** **to** **Power** **of** **5** **/ ** **Power** **of** **20** **/ ** **downstream** **team** **—** **per** **§**3 ** below** **and** **MI** **§**49 **. **  
6. **First** **task** **—** **one** **clear,** **completable** **action** **(see** `ADVANCE_...` **windows) **. **  
7. **First** **thank**-**you** **—** **logged** **or** **delegated** **per** **`THANK_YOU_...` **. **  
8. **First** **learning** **step** **—** **micro**-**training** **or** **reading** **(training** **index** **/ ** **Pathway** **). **  
9. **First** **leadership** **signal** **—** **opt**-**in** **invite** **or** **mentor** **moment,** **not** **a** **forced** **ladder** **(5C,** **5K** **). **

---

## 3. Power of 5 — tree placement rules

- **Join** **inviter’s** **team** **when** **appropriate** **(relationship** **+** **capacity** **;** **no** **silent** **dumping) **. **  
- **Place** **downstream** **to** **diversify** **a** **branch** **when** **geography,** **identity,** **or** **work** **style** **strengthens** **the** **tree** **(not** **for** **tokenism** **—** **for** **durability) **. **  
- **Create** **a** **new** **team** **if** **capacity** **exists** **(trained** **leader** **+** **follow**-**up** **room) **. **  
- **Power** **of** **20** **only** **when** **the** **leader** **can** **sustain** **care,** **follow**-**up,** **and** **retention** **(see** **`VOLUNTEER_RETENTION_...` **;** **default** **to** **P5;** **P20** **=** **higher** **care** **load** **—** **Steve** **locks** **policy** in **MI** **§**49 **). **

---

## 4. Landing pages and cards (design targets)

| Surface | Intent |
|--------|--------|
| **Invite** **someone** | **Share** **a** **trackable,** **compliant** **path** **(not** **a** **bulk** **dump** of **PII) **. ** |
| **Help** **onboard** **someone** | **Guide** **the** **ladder** **§**2 **;** **escalate** **placement** **questions** **to** **staff** **when** **unsure** **(see** `ESCALATION_PATHS` **). ** |
| **Place** **in** **a** **team** | **RACI**-**safe** **placement** **;** **no** **VFR** **in** **this** **card** **. ** |
| **Start** **a** **downstream** **Power** **of** **5** | **Only** **with** **training** **gate** **+** **retention** **readiness** **(5C,** **5K** **). ** |
| **Ask** **for** **placement** **help** | **Routes** **to** **V.C. **+ **/ ** **CM** **slice** **;** **not** **a** **public** **thread** **with** **names** **(privacy) **. ** |

Tie to **`DASHBOARD_OBJECTIVE_...` **: **“** **Help** **someone** **else** **”** **and** **relational** **cards** **align** **with** **P5,** **not** **GOTV** **cuts** from **a** **chat** **(5H** **/ **`SEGMENTED_MESSAGE_...` **). **

---

## 5. Safety and boundaries

- **No** **PII** **leakage** **in** **public** **briefs,** **cards,** **or** **chats** **(5F,** **5I,** **3H) **. **  
- **No** **voter** **file** **access** **expansion** **through** **onboarding;** **VFR** **stays** **R2+** **/ ** **stewarded** **(Pass** **2A,** **4** **). **  
- **No** **role** **unlock** **without** **training** **+** **RACI** **(5C** **+ ** **matrix) **. **  
- **No** **pressure** **or** **shame** **(decline** **with** **reason** **is** **valid;** **`ADVANCE_...` **+ **`VOLUNTEER_RETENTION_...` **). **

---

**Last** **updated:** **2026-04-27** **(Pass** **5L** **) **
