# Post-baseline Netlify test plan (REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0)

Stages are machine-listed in [`data/post-baseline-netlify-test-plan.json`](../data/post-baseline-netlify-test-plan.json): baseline done → migrate status clean → Netlify envs → deploy → build steps → hosted proof (no token / with token) → email diagnostics → SendGrid auth → **sandbox only** → live send still blocked.

**Until** production `_prisma_migrations` is aligned, **do not** treat Netlify production as green.

See also [`netlify-production-retry-readiness.md`](./netlify-production-retry-readiness.md).
