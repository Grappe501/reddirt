# Campaign OS Autonomy Boundaries

## Agent may control now (read + recommend)

- Build OS state snapshot and health score  
- Generate ranked workflow plans  
- Prepare reimbursement packet **drafts** (no finalize)  
- Prepare approval package **previews** (no email send)  
- Recommend routes and next actions  
- Append runtime audit + UX observations (metadata only)  
- Generate summaries, scores, checklists  

## Agent may prepare but not execute

- Approval package content  
- Reimbursement packet assembly  
- Google Calendar promotion payload preview  
- Event planning workbook drafts  
- Hot wash executive summary  
- Finance documentation gap list  
- County memory merge (human completes hot wash)  

## Human approval required

- Approve/deny events  
- Finalize reimbursement month  
- Promote to Google Calendar  
- Publish hot wash media  
- Write permanent agent memory  
- Save inferred fact card fields to ledger  

## Forbidden (agent must not execute)

- Send approval email  
- Post `FinancialTransaction` / FIN-1  
- Autonomous GCal writes  
- Autonomous reimbursement finalize  
- Delete ledger rows or destructive memory overwrite  

## Enforcement

- `human-approval-gate-matrix.ts`  
- `campaign-os-autonomy-boundary-enforcer` tool  
- Existing runtime `tool-router` + `tool-execution-guard`  

V2: policy graph tying each catalog tool to gate matrix automatically.
