# Email Architecture Truth Report

Direct answers for Steve — May 2026.

1. **What exists today?** RedDirt ECC (SendGrid bulk + import + sync), comms workbench (1:1 SendGrid/Twilio/Gmail), campaign-events approval email, email workflow queue (no send), volunteer copy templates, ops notifications, diagnostics sandbox.

2. **SendGrid?** Primary outbound for ECC send execution, thread email, approval packages, ops notifications, webhooks.

3. **Google Mail?** Gmail OAuth for ingest/review; optional send from workbench when scoped.

4. **Draft only?** countyWorkbench mailto, event `email-draft-builder`, Message Studio local drafts, volunteer template copy pages.

5. **Real sends?** ECC governed broadcast, comms threads, approval (if enabled), ops signup notification, diagnostics sandbox (sandbox mode).

6. **Contact lists?** Prisma `EmailAudienceDefinition` + ECC; V1 JSON `data/campaign-events/communications/`; SendGrid marketing lists after sync.

7. **Volunteers?** Signup → ops email; ECC profiles after import; not a single volunteer list yet.

8. **Hosts?** WorkflowIntake / public forms → ledger; manual profile link.

9. **Campaign team?** `approval-recipients.ts` + staff Gmail accounts.

10. **All-contact list?** **No production all-contact send** — blocked by policy + ASM + mass-email-safety-guard.

11. **Unsubscribe?** **Yes** in ECC — `SendGridSuppression`, ASM group env, contact preferences.

12. **Segmentation?** ECC audience studio + V1 JSON segments (demo).

13. **Audited?** **Yes** for ECC (`EmailSendExecution`, recipients, webhooks); approval `_approvalEmailLog`; V1 JSON `sends.json` scaffold.

14. **Replies?** Gmail ingest + workflow items — **no** auto-reply.

15. **Mass sends safe?** **Only** via ECC with preflight + human SEND APPROVED + suppression checks. Campaign OS V1 **blocks** all-contact.

16. **Production-ready?** ECC infrastructure mature but **hosted DB + env** dependent; approval email off by default.

17. **Dangerous/incomplete?** Dual webhooks; three send rails; sos-public bypass; ajax separate DB; missing env in `.env.example` for approval vars.

18. **Unify?** `/admin/communications` + ECC + Prisma graph — deprecate duplicate “send” buttons over time.

19. **Deprecate?** Hidden bulk automation; Formspree-only public contact; countyWorkbench as sender.

20. **Before large volume?** ASM group, suppression sync, consent on imports, hosted DB proof, dry-run, legal/compliance review, throttle plan.
