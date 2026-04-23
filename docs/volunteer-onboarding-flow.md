# Volunteer onboarding flow (VOL-CORE-1) (RedDirt)

**Packet VOL-CORE-1 (Part C).** Defines **onboarding** as a **philosophy-aligned journey**: empowering, low-friction, and **relational** from day one. **Not** a workflow engine spec—**conceptual** stages for future UX and copy. **No** schema.

**Cross-ref:** [`volunteer-philosophy-foundation.md`](./volunteer-philosophy-foundation.md) · [`power-of-5-system-integration.md`](./power-of-5-system-integration.md) · [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) · [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · [`public-site-system-map.md`](./public-site-system-map.md)

---

## 1. North star

- **Entry** honors motivation; **path** is **chosen**, not assigned.
- **First action** is **immediate**, **small**, and signals **you are trusted**.
- **Power of 5** appears **early** as *how we organize*, not as homework.
- **Continued engagement** blends **human** touchpoints with **AI coaching** (suggest, don’t command) and **GAME-1** momentum—when implemented.

---

## 2. Stage 1 — Entry

**Purpose:** Connect the person to the **movement’s why** before asking for outputs.

| Prompt (concept) | Captured as (today / future) |
|------------------|------------------------------|
| **Why are you here?** | Free text in form `Submission` / profile notes; optional tags later. |
| **What do you care about?** | Issues / community hooks—align with [`core-principles.md`](./philosophy/core-principles.md) plain-language frame. |

**Tone:** Calm invitation—**not** a lengthy interrogation. **Trust** starts with **listening**.

---

## 3. Stage 2 — Path selection

**Purpose:** Let volunteers **choose** how they contribute—**action over permission**, within safe rails.

| Path | Meaning |
|------|---------|
| **Connect people** | Relational organizing / ROE lane—**default** recommendation for most. |
| **Show up** | Events, rallies, festivals, visibility. |
| **Host something** | Gatherings, house meetings—links to host flows on public site. |
| **Help engagement** | Door, phone, text **when** program supports—human-governed. |
| **Spread the word** | Ambassador / comms-approved sharing. |
| **Use your skills** | Data, creative, tech, logistics—maps later to **skills** structure (TALENT-1 / profile). |

**System rule:** Paths set **copy**, **suggested next steps**, and **who** to introduce them to—not **RBAC** in VOL-CORE-1.

---

## 4. Stage 3 — First action

**Purpose:** **Prove** trust with one **concrete** step.

**Criteria**

- **Simple:** completable in minutes or one sitting.
- **Immediate:** no unnecessary wait for staff approval **unless** compliance requires.
- **Trust-reinforcing:** messaging like *“You’re cleared to…”* / *“Your next step…”*—never *“Pending review before you can…”* for basic organizing.

**Examples (product-agnostic)**

- Save **three** people you’ll talk to this week (precursor to Core 5).
- Sign up for **one** upcoming event (`EventSignup`).
- Send **yourself** a **draft** check-in message (human send) using an **approved** template.

**Existing repo path:** Public **`POST /api/forms`** can create **`User`** + **`VolunteerProfile`** + **`Submission`**; **VOL-CORE-2** may add a **structured** first-action type on `Commitment` or REL-2 rows.

---

## 5. Stage 4 — Power-of-5 entry

**Purpose:** Teach **how we scale trust**—not lists for lists’ sake.

- Introduce **Core 5** as **five people you personally commit to** this cycle ([`pod-system-foundation.md`](./pod-system-foundation.md)).
- **Optional:** short **mnemonic or code** per slot for volunteer check-ins (organizing practice)—**not** required by tech in VOL-CORE-1; if used, **never** replace PII-safe handling or consent.
- Point to **POD** support: who coaches them (human), not an algorithmic boss.

---

## 6. Stage 5 — Continued engagement

**Purpose:** Steady rhythm aligned with **calm leadership** philosophy.

| Mechanism | Behavior |
|-----------|----------|
| **Human** | POD leader / county captain check-ins; events; trainings. |
| **AI** | Suggests **next** relational or event steps per [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) and REL-1 assist—**no** auto-send. |
| **GAME-1** | **Momentum** and **achievements** reflect **real** KPIs; **no** punitive “streak loss” framing. |

---

## 7. Connection to existing public flows

- **Get involved / host / local team** routes ([`public-site-system-map.md`](./public-site-system-map.md)) are **physical** entry points; VOL-CORE **narrative** should **unify** them conceptually even before a single `/volunteer` shell exists.

---

*Last updated: Packet VOL-CORE-1 (Part C).*
