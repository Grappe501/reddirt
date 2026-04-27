# Candidate and campaign manager intake — gap analysis (not final build)

**Purpose:** List **what a future “candidate & CM intake”** should capture to power the **Guided Campaign System** / **Campaign Companion** (public vocabulary) without automating **law**, **message**, or **strategy** without **human** approval. **This file is a gap list**, not a shipped feature spec.

**Constraint:** `metadata` in `WorkflowIntake` and internal classification are **not** a substitute for a **governed** `CandidatePreferenceProfile` (future) with access control.

---

## A. What the candidate should be able to tell the system (target)

| Domain | Why it matters | Repo today |
|--------|----------------|------------|
| **Public values & priorities** | Drives `priorities` pages, OIS “strategy” text | **Site content**; not one merged profile table |
| **Tone & language guardrails** | Comms, **Message engine** | **Comms** plans + `style-guide`; **message engine** types — partial |
| **What is off-limits in attack / contrast** | **Compliance** / counsel | `ComplianceDocument` store; not wired to public auto-block |
| **Geographic focus** | Resource allocation, county OIS | `User.county` on supporters; **candidate** not as structured |
| **Staffing & authority** | `CampaignTask` assignees, **PositionSeat** | `PositionSeat` exists; not full **org chart** product |
| **Schedule sensitivity** | Events, comms | `CampaignEvent` + calendar — partial |
| **Comms approval rules** (who signs sends) | Prevents **unreviewed** broadcast | `CommunicationDraft` review relations on `User` — process exists; policy must be **documented** |
| **Crisis escalation** (who to call) | **Off-app**; maybe `SiteSettings` or **manual** | **No** dedicated crisis router in schema |

## B. Philosophy and risk tolerance (human captures)

- **Philosophy:** service, transparency, competence — must match **public site** and **briefs** (not stored as one “philosophy JSON” in Pass 2 review).  
- **Risk tolerance** for **negative contrast:** **compliance** + **owner**; ** never** “auto-approve” opposition lines.

## C. What the Campaign Companion (concept) must *learn* (over time)

- **Role** and **geography** of the user (when auth + **VolunteerProfile** + assignments exist).  
- **Intake** outcomes (triage labels from internal classification — **map** to **Organizing Guide** categories in UI, not raw model names).  
- **Season** of campaign: phase from **date** and **GOTV** window — **future** feature.  
- **Message** performance (aggregate) — NDE + comms **events** where instrumented.

## D. What must **never** be automated without approval

- **Paid media** and **legally sensitive** comms.  
- **Voter** contact scripts that **imply** individual targeting to volunteers.  
- **Exports** of **PII** from voter file.  
- **Public** **opposition** claims (must be **sourced** and **counsel-reviewed** per campaign rules).  
- **Crisis** public posts.

## E. Current repo support (summary)

- **Comms** structure is **strong** for *how* to package messages.  
- **Candidate** briefs path exists (`admin/candidate-briefs/*`).  
- **No** single **`CandidateIntakeConfig`** with typed fields for all items above.  
- **`User` + `WorkflowIntake`** for supporters — **not** the same as **candidate** profile.

## F. Missing build pieces (prioritized for later)

1. **Typed** `CandidateCampaignConfig` (or similar) in DB with **versioning** and **RLS** / staff-only.  
2. **Link** compliance docs to comms and **forbidden-phrase** lints (internal, not user-shaming).  
3. **CM** onboarding **checklist** as **`CampaignTask`** template pack (seed or admin UI).  
4. **NDE** wave tied to **candidate-approved** **narrative** IDs.

## G. Manual sections to write

- **Ch 12** (candidate/CM) with **RACI** and **intake** outline from this file.  
- **Ch 20** (Campaign Companion) boundaries.  
- **Ch 21** (adaptive strategy) what is **forbidden** to automate.

**Last updated:** 2026-04-27
