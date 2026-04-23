# Youth agent ingest map (YOUTH-1) (RedDirt)

Companion to [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md). **T1–T3**-style **ingest** plan for any **future** RAG or assistant that **supports** (never replaces) **youth** **programs**. **Not** a license to **auto**-message **minors** or to **bypass** review.

---

## 1. Messaging style (for training chunks)

| Topic | Ingest note |
|------|-------------|
| **Clarity** | Short sentences; **one** primary CTA per message template. |
| **Safety** | **Never** request **sensitive** PII in public forms; point to **staff** **channels** for edge cases. |
| **Inclusion** | **Avoid** **age-gate** **language** that **excludes** **caretaker**-mediated volunteers. |
| **Escalation** | Every youth-facing doc should **name** **who** to ping for **safety** or **compliance** (human). |

---

## 2. Training content (T1 first)

- **T1 (global campaign):** code of conduct, event safety checklist, “what this campaign does / does not ask of youth,” **queue-first** explainer (aligned with **email workflow** handoff).
- **T2 (field / local):** county or school **context** from **curated** human-written blurbs (not auto-scraped directories).
- **T3 (peer leadership):** **playbooks** only **after** T1+T2 exist; must **repeat** **adult** **oversight** **requirements**.

---

## 3. Engagement strategies (guardrails, not growth hacks)

- **Events and shifts** as default entry — **not** “DM everyone” as first behavior.
- **Peer recruitment** is **in-person first**; digital peer loops require **adult** **review** in **YOUTH-2+**.

---

## 4. Platform preferences (documentation)

- The repo does not mandate a **single** **channel**. Default posture: **email** and **in-app** **task** flows for anything **durable**; **SMS** only where **opt-in** and **parent/guardian** **policy** **exists** in ops (outside YOUTH-1 code).

---

## 5. Guardrails for AI and automation

- **No** model-generated **outbound** to youth lists **without** **human** **queue** (same as **E-1+** for email workflow).
- **No** “sentiment” or **maturity** **scores** in product; **TALENT-1** **signals** are **advisory** only.
- **YouthEngagementSignal** types in `youth.ts` are **vocabulary** for **future** observation events — **not** persisted in YOUTH-1.

---

*Last updated: Packet YOUTH-1.*
