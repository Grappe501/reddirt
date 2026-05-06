# Email Send Execution — Preflight Hardening 1.0

**Packet:** **EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0**  
**Lane:** `RedDirt/` only · **No** schema migrations · **No** sends · **No** new SendGrid/Gmail API calls from preflight paths

## What shipped

1. **Expanded `runSendExecutionPreflight`** (`send-execution.ts`) — checklist now covers: governance/final-confirmation posture, shared draft presence + `APPROVED_FOR_SEND_GOVERNANCE`, non-empty send packet, subject, **preheader**, body, audience link + ACTIVE status, **full `suppressionChecklist`** on packet (broadcast), **operator + comms** approval checklist (and **not** “final send operator not yet authorized”), sender identity (execution row or `SENDGRID_FROM_*`), SendGrid env (broadcast vs test), API key, **explicit ASM / unsubscribe posture** for broadcast, SYNCED sync run for broadcast, import consent flag when import-sourced emails appear, suppression overlap fatal case, recipient readiness.

2. **Structured `preflightJson`** — each check row may include **`whyFailed`**, **`fixHref`**, **`fixLabel`** (operator routes only). **`recipientBreakdown`** object stores: audience matched profiles, candidates with valid email, profiles missing email, excluded suppressed, excluded missing consent/source, final eligible READY count. **`packet`:** `EMAIL-SEND-EXECUTION-PREFLIGHT-HARDENING-1.0` marker.

3. **Pure JSON helpers** — `send-execution-preflight-json.ts` for parsing without pulling Prisma into client bundles.

4. **Send Execution `#ops`** — `SendExecutionOperationsPanel` shows PASS/FAIL cards with “why” copy and fix links; recipient breakdown panel; **Copy preflight summary** (`CopyPreflightSummaryButton` client control).

5. **Read model** — `getEmailCommandCenterSnapshot.sendExecution.preflightFailedTopBlockers`: first-failed check id tallied from recent `PREFLIGHT_FAILED` rows (read-only).

6. **Daily + Analytics** — Daily priority card for preflight failures links to **`/analytics#send-execution-preflight`** with top-blocker subtext; next-actions mention rollup. Analytics **Send execution analytics** section (`#send-execution-preflight`) lists the same rollup with link back to **`/send-execution#ops`**.

## Operator notes

- Older executions without send-packet **suppressionChecklist** / **approvalChecklist** will fail preflight until operators save a full send packet from Message Studio and recreate or update execution payload.
- **No mail** is sent by preflight; `mail-send` is unchanged and only invoked from explicit test/final actions after gates.

## Checks (this packet)

From `RedDirt/`:

- `npm run email:db:diagnose`
- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`
