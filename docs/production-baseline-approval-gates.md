# Production baseline approval gates (REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0)

Every gate in [`data/production-baseline-approval-gates.json`](../data/production-baseline-approval-gates.json) stays `status: "pending"` until a human records evidence **outside** this repo per policy.

**Approval phrase (Steve):** `STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION` — store in your approval system; do not paste secrets into chat.

**Live sends** and **Netlify production retry** remain **blocked** until post-baseline verification — [`post-baseline-netlify-test-plan.md`](./post-baseline-netlify-test-plan.md).
