# Approval recipients and email scaffold

**Config:** `src/lib/campaign-events/approval-recipients.ts`  
**Email sending:** disabled (`EMAIL_SEND_ENABLED = false`)

## Default candidate recipients

| Role | Email |
|------|--------|
| Candidate primary | `kelly@kellygrappe.com` |
| Candidate campaign account | `grappe4arkansas@gmail.com` |

## Not configured (TODO)

- Campaign manager email — `null`
- Treasurer email — `null`
- Compliance email — `null`

Do not invent addresses. Update `approval-recipients.ts` when Steve provides them.

## Where recipients appear

| Surface | Behavior |
|---------|----------|
| `buildApprovalPackage()` | `recipientsPlaceholder`, `candidateApprovalTo` |
| `ApprovalPackagePreviewPanel` | `ApprovalRecipientsBanner` + To line |
| `ApprovalRecipientsBanner` | Shared display component |
| `TravelReportSendScaffold` | Disabled send panels with default To |
| `EmailDraftScaffoldModal` | `audience="candidate_approval"` prefills both candidate emails in **To** (editable) |
| Candidate / CM dashboards | Banner at top |

## Host vs candidate drafts

- **Host logistics** drafts (`EmailDraftScaffoldModal` default): To = host email from fact card, or empty.
- **Candidate approval** drafts: pass `audience="candidate_approval"` to prefill `kelly@…, grappe4arkansas@…`.

No transport layer — drafts may save on the event record via existing actions; nothing is sent.

## Future send workflow

1. Configure CM / treasurer / compliance in `approval-recipients.ts`.
2. Enable `EMAIL_SEND_ENABLED` only after SendGrid (or comms hub) packet + human-approval gates.
3. Wire approval package builder → outbound MIME with signed workbench links.
4. Log sends on `factCard._communication` thread.
