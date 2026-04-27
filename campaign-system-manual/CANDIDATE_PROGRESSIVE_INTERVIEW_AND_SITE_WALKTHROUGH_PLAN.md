# Candidate progressive interview and site walkthrough plan (Manual Pass 5G)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Design** for **weaving** `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` into `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` — not the full bank in one session, not a shipped product, and not a path that auto-publishes (see Pass 5F, 5G, `CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md`).

**Ref:** `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` · `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §44

---

## 1. Start easy (first pass, first pages)

- “Does this sound like you?”
- “Would you say this differently?”
- “Is anything missing (at a high level)?”
- “Too strong, too soft, or about right?”

**One** light question per page in the first tranche, not every row from the question bank (see `CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md` — progressive pull, not a dump).

---

## 2. Progressively deeper (later passes or later sessions)

Examples of *shape* only — not approved copy; no fabrication of Kelly’s views; MCE+comms for hot topics; `playbooks/ESCALATION_PATHS` for press/legal when needed.

- “What would you say to a skeptical Republican voter about SOS service?” (5E §6 — civic service, not pandering)
- “What would you say to a county clerk about how you’d support their office?” (no named smear; service tone)
- “What would you say to someone worried about election integrity, using only vetted sources?” (5D + `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md`)
- “When a non-SOS issue comes up, what is your plain bridge?” (5F A–D; defer if D)

---

## 3. Page-by-page question strategy (design)

- Map **1–3** question-bank *tags* to the page (e.g. election / clerks, not a random high-risk non-SOS topic on the County Clerks page). Operator or MCE curates; not an undifferentiated model dump (see `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md`, 5B, 5F).
- Deeper Qs in passes 3–5 of `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` (§7), or in a *separate* session for hostile frames.

---

## 4. Candidate fatigue rules (governance for a future build)

- **Stop** after *N* hard questions in a row (owner sets *N*; e.g. 3) — MCE+comms as gate for “hard” (see MI §44).
- **“Later”** = queue a refinement item (Level D) + packet triage, not a faked A-class answer (see `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`); not a public-facing string until approved.
- **Do not** force the full question bank in one day; de-dupe similar questions in `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md`.
- **No** GOTV or VFR actions from the wizard (5C, 2A spine); Pathway/CTA only as allowed.

---

## 5. Confidence building (UI goals)

- Show **completed** sections and **clear** “ready for team review” vs “needs your answer” vs “needs counsel/comms” — plain labels, not internal system codes (5F `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md`).

---

## 6. “Website wizard” mode (end-to-end design loop)

1. **Page** presented; candidate reads.  
2. **Candidate** approves, edits, or flags (see `CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` §6).  
3. **Agent** (when built) asks **1–3** **related** questions from the *curated* bank slice.  
4. **Candidate** answers.  
5. **Agent** summarizes *intended* update; candidate confirms.  
6. **Admin** packet generated with impact tier (`WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md`); no auto-publish on high-impact lines (`CANDIDATE_EDITING_RIGHTS_AND_NO_APPROVAL_EXCEPTIONS_POLICY.md`).

---

**Last updated:** 2026-04-28 (Pass 5G)
