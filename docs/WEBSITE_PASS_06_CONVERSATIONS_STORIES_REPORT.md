# Website Pass 06 — Conversations & Stories hub upgrade

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_05_PRIVACY_TRUST_REPORT.md`; `docs/WEBSITE_UPGRADE_PASSES_AFTER_MESSAGE_SYSTEM.md`; `docs/NARRATIVE_PUBLIC_MEMBER_HUB_REPORT.md`; `docs/audits/MESSAGE_AND_NARRATIVE_DISTRIBUTION_SYSTEM_AUDIT.md`

---

## 1. Mission

Make the **public / member-facing message hub** feel **alive**: clear weekly spine, scannable language for a Power of 5 circle, place-based story prompts, county packets, volunteer shareables, listening practice, upcoming narrative priorities, and a **direct path to Power of 5 onboarding** — without adding publishing, voter-linked data, or new auth.

---

## 2. Route decision: `/messages` (no `/conversations` duplicate)

| Question | Answer |
|----------|--------|
| Does `/messages` exist? | **Yes** — `src/app/(site)/messages/page.tsx` (public `(site)` shell). |
| Does `/conversations` exist as a page? | **No** — there is **no** `src/app/**/conversations/page.tsx`. |
| Where does nav send “Conversations & Stories”? | `src/config/navigation.ts` — `groupLandingHref: "/messages"` and child link **Conversations & Stories** → `/messages`. |

**Decision:** **Upgrade `/messages` only.** Introducing `/conversations` would **duplicate** the same IA and split SEO/bookmarks. The nav label “Conversations & Stories” already describes the hub; the canonical URL stays **`/messages`**.

---

## 3. Read-in summary (sources)

| Source | Use |
|--------|-----|
| `WEBSITE_PASS_05_PRIVACY_TRUST_REPORT.md` | Trust language and public-surface guardrails; hub copy stays aggregate-safe, demo/seed flagged. |
| `src/lib/message-engine/templates.ts` | Expanded **`MESSAGE_STARTER_LOCAL_STORY_PROMPTS`** (placeholders `{{place_name}}`) for hub “local story prompts.” |
| `src/lib/message-engine` + `WhatToSayPanel` | **Client “conversation lab”** on the hub — registry-backed starters, same engine as onboarding. |
| `src/lib/narrative-distribution/public-member-hub.ts` | **`buildPublicMemberHubModel()`** — extended model: priorities, five scripts, local prompts from registry, **`volunteerSharePackets[]`**, onboarding-first CTA. |
| `src/app/(site)/stories/page.tsx`, `src/app/(site)/blog/page.tsx` | Linked from **upcoming narrative priorities** and intro pills. |

---

## 4. Deliverables

### 4.1 Public hub sections (all present on `/messages`)

1. **Message of the week** — hero card (existing pattern, refreshed week label).  
2. **Upcoming narrative priorities** — three timeline-style cards with links to Stories, Blog, Listening sessions.  
3. **What to say to your five** — five speak-aloud beats (static curated lines).  
4. **Conversation lab** — **`NarrativeMemberHubConversationLab`** wraps **`WhatToSayPanel`** (interactive; message content engine).  
5. **Local story prompts** — cards driven by **`MESSAGE_STARTER_LOCAL_STORY_PROMPTS`** (with `your area` substitution on the server).  
6. **County message packets** — renamed from “county story cards”; same three demo counties + command + OIS links.  
7. **Volunteer share packets** — **three** packets: DM/text, event invite, social spark (`volunteerSharePackets`).  
8. **Listening prompts** — unchanged structure; still links **Election listening sessions**.  
9. **Power of 5 onboarding** — intro **quick-link pill**, anchor CTA **`/onboarding/power-of-5`** (primary), plus **Start a local team** secondary.

### 4.2 Files touched

| File | Change |
|------|--------|
| `src/lib/message-engine/templates.ts` | Added **three** `LocalStoryPrompt` rows (workday, first vote, poll workers). |
| `src/lib/narrative-distribution/public-member-hub.ts` | New hub fields; **`volunteerSharePackets`** array; priorities; **what to say to your five**; CTA primary → onboarding. |
| `src/lib/narrative-distribution/index.ts` | Re-export new public hub types. |
| `src/components/narrative-distribution/public/NarrativeMemberHubConversationLab.tsx` | **New** client island for `WhatToSayPanel`. |
| `src/components/narrative-distribution/public/NarrativeMemberHubView.tsx` | Reordered sections, quick-link pills, new bands. |
| `src/app/(site)/messages/page.tsx` | Hero subtitle + meta description aligned with new sections. |
| `src/components/integrations/NarrativeDistributionSummaryPanel.tsx` | Uses **`volunteerSharePackets[0]`** for OIS strip (fallback if empty). |

### 4.3 Guardrails

- **No** new routes under `/conversations`.  
- **No** voter file, Prisma, or send/publish actions on this pass.  
- **Demo / seed** badges and notice retained; interactive panel uses existing **public_volunteer** registry only.  
- Stories/Blog remain **system of record** for long-form; hub is the **field shelf**.

---

## 5. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 6. Follow-ups (not in this pass)

- Wire **message of the week** and priorities to editorial status when comms rails exist.  
- Optional: `route:/messages` semantic search chunk if site search should weight the new headings.  
- When live county packets ship, replace demo slugs or hydrate from the same registry as admin narrative distribution.

---

**End of report.**
