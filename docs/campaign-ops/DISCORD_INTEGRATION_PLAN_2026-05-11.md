# Discord integration plan (volunteer OS)

**Date:** 2026-05-11  
**Status:** Planning — no bot or live routing in Script 6.

## Principles

- Discord is **encouraged** for day-to-day volunteer connection; the **team dashboard** remains the source of truth for tasks, maturity, and review-gated assets.
- **Never post voter PII** (names tied to registration status, lists, IDs, or file extracts) in Discord. Use secure campaign ops channels and approved tools for sensitive coordination.
- Automated Discord actions ship **after** human-reviewed email/automation patterns are stable.

## Phased rollout

1. **Invite link during onboarding** — Surface a single, campaign-managed invite during `/volunteer` and team dashboard onboarding copy. Track clicks loosely (no PII in analytics payloads).
2. **Role-based channel assignment** — Map volunteer roles (Events, Social, Power of 5 / VR) to baseline channel bundles once membership is verified.
3. **Team channels** — Private or semi-private channels per `teamSlug` / geography triad for coordination and celebration.
4. **Lane channels** — Shared lanes (e.g., events ideas, social asset drops) moderated for tone and compliance.
5. **Region channels** — County / multi-team regions for cross-team learning and resource swaps (still no voter PII).
6. **Community channels** — Language- and community-specific spaces (e.g., Hispanic / Marshallese partners) with bilingual moderation standards.
7. **Bot-guided room placement** — Discord bot suggests channels based on onboarding answers and team maturity (human confirm before moves).
8. **Task reminders** — Optional digest linking back to dashboard Action Queue items (never embed restricted lists).
9. **Help routing** — `/help` or button flow creates a private thread with on-call ops roles; escalations mirror email ops rules.
10. **No voter PII rule** — Automated moderation + staff training + incident response checklist; repeated violations trigger removal per community guidelines.

## Dependencies

- Verified volunteer identity (magic link / session) before sensitive channel access.
- Campaign-approved moderation playbook and backup moderators per region.
- Alignment with Script 7 email sending and ops inbox routing.

## Out of scope (Script 6)

- Bot implementation, OAuth, or channel automation.
- Live invite URLs in production (copy references “future invite” until campaign supplies a stable link).
