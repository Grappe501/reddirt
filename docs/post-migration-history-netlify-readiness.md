# Post migration history Netlify readiness

**Machine JSON:** [`data/post-migration-history-netlify-readiness.json`](../data/post-migration-history-netlify-readiness.json)

Netlify production retry stays **blocked** until migration-history baseline is **actually executed** on production, postcheck passes, and a **separate** Steve-approved Netlify slice runs.

`scripts/netlify-build.sh` still runs `npx prisma migrate deploy` — history must be aligned first.

Hosted DB proof and email diagnostics follow a successful deploy path, documented elsewhere.
