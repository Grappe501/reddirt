# Power of 5 — system integration (VOL-CORE-1) (RedDirt)

**Packet VOL-CORE-1 (Part D).** Binds **Power of 5** to **REL-1**, **GAME-1**, and **FIELD-1**: commitments, ownership, communication responsibility, and **optional** coding conventions. **Docs only**—no migrations.

**Cross-ref:** [`pod-system-foundation.md`](./pod-system-foundation.md) (REL-1) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) · [`volunteer-xp-model.md`](./volunteer-xp-model.md) (GAME-1) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`county-registration-goals-verification.md`](./county-registration-goals-verification.md)

---

## 1. Core commitment

- Each volunteer **commits to five** relational priorities (**Core 5**) for the cycle—approximately five; policy may allow **4–6** ([`pod-system-foundation.md`](./pod-system-foundation.md)).
- **System meaning:** five **named** relationships the volunteer **owns** for intentional follow-up, registration awareness, and turnout support—not their entire extended network.

---

## 2. Optional “code” system (organizing practice)

**Purpose:** Lightweight **mnemonics** for coaching and check-ins (e.g. labels **A–E**, **role tags** like “family,” “neighbor,” “faith,” “work,” “other”)—**optional** and **volunteer-controlled**.

| Rule | Implication |
|------|----------------|
| **Optional** | Must not block saving a contact or completing onboarding. |
| **Not PII** | Codes are **categories**, not substitutes for secure name/phone storage. |
| **Coach-facing** | Help POD leaders ask “how is slot **3** doing?” without exposing details in group settings. |

If implemented in software, store as **metadata** on future **`RelationalContact`** rows (REL-2), namespaced and **consent-aware**.

---

## 3. Relationship ownership

- **Owner** = **`User`** / **`VolunteerProfile`** who created and maintains the row (future `volunteerUserId` on `RelationalContact`).
- **One primary owner** per relational row for KPI attribution; **shared** outreach only with explicit SOP (REL-3 dedupe).

---

## 4. Communication responsibility

- **Human responsibility:** The volunteer **chooses** when and how to reach each Core 5 contact; AI may **draft**; **human sends** per REL-1 / E-1 policy.
- **Quality:** KPIs pair **reach** with **match quality** and **registration help** where known—avoid pure volume incentives ([`pod-system-foundation.md`](./pod-system-foundation.md)).

---

## 5. Connection to REL-1

| REL-1 element | Power of 5 link |
|---------------|-----------------|
| **`RelationalContact` (REL-2)** | Core 5 = **five** rows (or flagged subset) **owned** by volunteer. |
| **KPIs** | **Relationships added**, **reached**, **committed**, **matched** roll up from Core 5 + extended network ([`relational-kpi-foundation.md`](./relational-kpi-foundation.md)). |
| **POD** | POD leader **coaches** Core 5 **discipline**; reporting chain in POD doc. |

---

## 6. Connection to GAME-1

| GAME-1 element | Power of 5 link |
|------------------|-----------------|
| **XP** | Adding and **moving** Core 5 contacts through honest states yields XP per [`volunteer-xp-model.md`](./volunteer-xp-model.md). |
| **Achievements** | **“Core 5 complete”** milestone (meaningful engagement on all five, not just created stubs). |
| **Unlocks** | Completing Core 5 **may** unlock **expanded** templates or **mentor** paths—policy decision, not automatic in VOL-CORE-1. |

---

## 7. Connection to FIELD / county goals

- Volunteer’s **`User.county`** / **`FieldAssignment`** places their **effort** in geographic context.
- **`CountyCampaignStats.registrationGoal`**: Core 5 work **informs** county narrative when contacts map to county and dedupe rules are clear—**does not** by itself prove goal closure ([`relational-kpi-foundation.md`](./relational-kpi-foundation.md)).
- **Evangelists** and **county captains** use Core 5 **coverage** across volunteers as a **health** metric for the county field program.

---

*Last updated: Packet VOL-CORE-1 (Part D).*
