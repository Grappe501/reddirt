# Cursor script — Phase 9: inferred Gmail participants

Active lane: RedDirt (worktree `H:\SOSWebsite\RedDirt-contact-intel`)
Branch: `feat/contact-intelligence-v1`
Phase: 9 — Opt-in Gmail participant discovery
One objective: Optionally derive email identities from Gmail and mark them inferred until an operator promotes them.

Allowed paths:
- `src/lib/contact-intel/gmail-inferred/**`
- person/method additive flags (`confidence` / `inferred`)
- `docs/contact-intelligence/**`

Forbidden:
- Auto-creating trusted contacts
- Any send
- Using Gmail body text as verified profile facts without review
- Other lanes; C: scratch

Reuse: existing `GmailMessageRecord` / `CommunicationIdentity` as adapters if already populated; Contact Intelligence remains the operator library.

Steps:
1. Explicit opt-in per mailbox.
2. Create inferred methods from From/To/Cc addresses.
3. Library filter: Verified vs Inferred.
4. Promote-to-trusted is a manual action.

Acceptance: appearing in an email does not make a person trusted; search can hide inferred by default.

Stop if: this would send mail, or inferred rows cannot be distinguished from spreadsheet imports.
