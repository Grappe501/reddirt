# Relational organizing — AI assist (REL-1) (RedDirt)

**Packet REL-1 (Part F).** How **AI** supports relational organizing while preserving **human relationships** and **governance** consistent with BRAIN-1, ALIGN-1, and **queue-first** email workflow.

**Cross-ref:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · [`relational-voter-integration.md`](./relational-voter-integration.md)

---

## 1. AI capabilities (intended)

| Capability | Description |
|------------|-------------|
| **Message scripts** | Generate **draft** SMS, call openers, or DM templates from relationship type + county + campaign alignment (`prompts.ts`, RAG chunks). |
| **Personalization** | Adjust wording for **relationship** (cousin vs coworker) and **persuasion** level—**suggestions** the volunteer edits. |
| **Tone and approach** | Calm, respectful, non-deceptive tone per brand; flags **high-risk** claims for human review. |
| **Outreach planning** | Suggest order of contacts (“who to check in with this week”) from Core 5 + `lastContactedAt`. |
| **Follow-up coaching** | After volunteer logs outcome, propose **next step** (e.g. registration deadline reminder + link to official tool). |

**Implementation note:** REL-1 does **not** add API routes; future REL-AI packets should register touchpoints in `ai-brain.ts` / provenance patterns (`metadataJson` namespaced `roeAiAssist` or similar).

---

## 2. Hard constraints (non-negotiable)

| Constraint | Rationale |
|------------|-----------|
| **AI does NOT auto-send** | All outbound sends go through **human** action on the appropriate comms path or personal device **outside** auto-send—same ethic as E-1/E-2 (no magic SendGrid from a relational draft panel). |
| **AI does NOT impersonate** | Copy must be clearly **from the volunteer**; no “pretend you are the candidate” in DMs to friends unless explicitly approved and legally vetted. |
| **AI does NOT fabricate relationships** | Model must not invent contacts, matches, or commitments; **only** structure what the volunteer supplied. |
| **No fabricated voter facts** | Registration status and file fields come from **`VoterRecord`** + human confirmation—not from LLM guessing. |
| **PII discipline** | Minimize logging of raw scripts containing PII; align with compliance and retention policy. |

---

## 3. Relationship to existing AI surfaces

- **RAG / assistant** — Campaign brain corpus for **issue** and **tone** alignment.
- **Comms AI (`comms/ai.ts`)** — Thread summaries for **staff** threads; distinct from volunteer-to-friend texts unless product unifies (COMMS-UNIFY-1 caution).
- **E-2 heuristics** — Pattern for **provenance** and **operator override** applies to relational AI suggestions (preserve human edits; log overrides in future OVR packets).

---

*Last updated: Packet REL-1.*
