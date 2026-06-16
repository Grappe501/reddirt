# PPEN A.0c — Volunteer Intake & Activation Layer

**Status:** Doctrine · **Gate:** Pilot smoke, then A.0b schema · **Lane:** `RedDirt/`  
**Updated:** 2026-06-16  
**Related:** [`PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md`](./PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md), [`ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md`](./ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md)

---

## The real front door

The operating system begins at the **website volunteer form** — not County Workbench, Community Workbench, or PPEN admin.

Everything upstream of activation is intake. Everything downstream is the OS.

---

## Activation pipeline (production target)

```text
Volunteer Signup (public form)
        ↓
Confirmation Email
        ↓
One-Time Activation Link
        ↓
Create Username
        ↓
Create Password
        ↓
Accept Terms
        ↓
Create Person Record
        ↓
Create Journey Record (My Journey shell)
        ↓
Create Participation Record(s)
        ↓
Assign County
        ↓
Assign Community (optional)
        ↓
Assign Coalition Interests (optional)
        ↓
Grant Level 1 (Participant)
        ↓
Enter OS → My Journey home
```

---

## Records created at activation

| Step | Object |
|------|--------|
| Signup | Intake submission (staging) |
| Activation complete | **Person** |
| Journey shell | Journey state (My Five / Help 10 tracks empty) |
| County assign | **Participation** (`context: county`, slug, role: volunteer) |
| Community assign | **Participation** (`context: community`, slug) |
| Coalition interests | **Participation** (`context: coalition`, slug, status: interested) |
| L1 grant | Access level on Person + scoped permissions |

One Person. One or more Participation records. No duplicate contact rows.

---

## Integration points

| System | Hook |
|--------|------|
| **CCH** | L1 → public Substack feed subscription; active + training → insider feed |
| **County view** | Participation with `countySlug` appears in volunteer pipeline counts |
| **Community view** | Participation with `citySlug` / workbench slug |
| **Coalition view** | Participation with coalition workbench slug |
| **WorkflowIntake** | Existing admin intake may feed staging — merge into A.0c, not parallel silo |

---

## A.0c deliverables (after A.0b schema)

1. Public volunteer signup form (website lane integration per coordination rules)  
2. Confirmation email template + send path  
3. One-time activation token (expire, single use)  
4. Username + password + terms acceptance UI  
5. Person + Journey creation on successful activation  
6. Participation record creation (county required; community/coalition optional)  
7. L1 access grant + redirect to **My Journey** shell  
8. Admin queue: pending activations, failed/expired tokens  

---

## My Journey — post-login home

First screen after activation (see OS doctrine):

```text
Welcome Back · My Five · Help 10 · Events · Hours
Leadership Opportunities · County · Current Role · Next Step
```

All metrics record-backed. Empty states honest until A.1 / A.1b engines populate relationships.

---

## Build order

1. Pilot smoke (Sherwood + Jacksonville) — **no PPEN code before this passes**  
2. **A.0b + A.0c together** — Person/Participation/Access/My Journey + volunteer intake → activation → L1 → My Journey  
3. A.0 — Leadership opportunities  
4. A.1 / A.1b — My Five + Help 10 CRUD  
5. A.2 — HCI  

Identity without intake is incomplete. Intake without identity is another disconnected form.

**Not before A.0b:** Participation records depend on Person schema.

---

## Verification

- Signup → email → activate → My Journey (no manual admin for happy path)  
- One Person id; county Participation visible on Faulkner county view when assigned  
- Re-activation blocked for same email; token single-use  
- No fake counts on county pipeline — only Participation records increment stages  
