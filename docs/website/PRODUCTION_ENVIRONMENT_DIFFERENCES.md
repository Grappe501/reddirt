# Production environment differences

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Question answered:** Does Netlify behave differently than local — and is the gap silent?

## Environments compared

| Environment | How probed | What voters / Kelly see |
| --- | --- | --- |
| Local `next dev` | Prior QA (port 3456) | Current trust-funnel + photos + confirmed endorsements |
| Local **production** `next start` | Port **3457** this pass | Same current public spine (Government That Works, FEATURE photos, four endorsements) |
| Netlify **kgrappe** | `https://kgrappe.netlify.app/` HTTP 200 | **Older** publish — headline still “A Secretary of State for Everyone”; **no** “Government That Works” |
| Netlify **kelly-sos-public** | Workaround site | **HTTP 404** at probe time |

## Differences (explicit — not silent)

| Topic | Local prod build | Live Netlify (kgrappe) | Risk |
| --- | --- | --- | --- |
| Homepage headline / spine | Current (“Government That Works”) | Older trust-funnel copy | **High** — Kelly’s polished local ≠ public URL |
| Latest Campaign Photos | Present | Absent on last known ready deploy | High |
| Confirmed endorsements | Four named orgs/leaders | Not on stuck deploy | High |
| Deploy pipeline | Local `next build` **green** | Lambda upload **400** on `___netlify-server-handler` (prior operator log) | Blocks shipping the green binary |
| Database schema | Local can lag migrations → county pages previously 500’d | Production DB may differ; must not assume local migrate state | Medium — mitigated by degrade paths |
| Env secrets | `.env.local` / lane env | Netlify site env scopes | Ops — do not commit secrets |

## What matches

- Same repo / same Next app architecture.
- Local production binary proves the **code** is deployable.
- Failure mode for “voters see old site” is **platform deploy**, not “homepage won’t compile.”

## Separation rule (locked for this report)

> Netlify Lambda / site stuckness is a **platform gap**, separate from local production-build readiness — but it **still** prevents answering “yes” to “Arkansas voters see what Kelly sees locally” until a successful publish lands.

## Operator actions (outside this verification pass)

1. Unblock `kgrappe` Lambda upload **or** bring `kelly-sos-public` (or alternate host) to a successful publish of this branch.  
2. After publish: re-run homepage content smoke against the live URL (Government That Works + endorsements + photo band).  
3. Keep local builds quiet (no concurrent `next start`/`dev` during `next build`).
