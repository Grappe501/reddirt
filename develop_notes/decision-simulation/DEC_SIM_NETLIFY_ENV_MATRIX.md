# dec-sim Netlify environment matrix

Site: `dec-sim` (`dec-sim.netlify.app`)  
Repository: `Grappe501/reddirt`  
Production branch: `main`  

Do not place values in this document.

| VARIABLE | BUILD REQUIRED | RUNTIME REQUIRED | SECRET | STATUS | PURPOSE |
|---|---|---|---|---|---|
| DATABASE_URL | yes | yes | yes | required | Prisma / queue job persistence |
| DIRECT_URL | yes | yes | yes | required | Prisma migrate deploy |
| OPENAI_API_KEY | no | yes | yes | required | Server-side advisory simulations |
| ADMIN_SECRET | no | yes | yes | required | Admin API + worker fallback auth |
| NEXT_PUBLIC_SITE_URL | yes | yes | no | required | Worker self-kick origin |
| NEXT_PUBLIC_SUPABASE_URL | yes | yes | no | required | Hosted session / admin helper |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | yes | yes | no | required | Hosted session / admin helper |
| NEXT_PUBLIC_DECISION_SIM_SITE | yes | yes | no | required | Isolate product redirects and stash |
| SKIP_DB_SEED | yes | no | no | required | Avoid campaign seed on this product site |
| DECISION_SIM_WORKER_SECRET | no | recommended | yes | optional | Dedicated worker header; falls back to ADMIN_SECRET |
| DECISION_SIM_MAX_LIVE_RUNS | no | no | no | optional | Default 10 |
| DECISION_SIM_QUEUE_CONCURRENCY | no | no | no | optional | Default 1 |
| DECISION_SIM_CHUNK_SIZE_100 | no | no | no | optional | Default 1 |
| DECISION_SIM_CHUNK_SIZE_1000 | no | no | no | optional | Default 1 |
| DECISION_SIM_MAX_ACTIVE_JOBS | no | no | no | optional | Default 2 |
| DECISION_SIM_MAX_RUNS_PER_JOB | no | no | no | optional | Default 1000 |
| DECISION_SIM_MAX_RETRIES | no | no | no | optional | Default 2 |
| DECISION_SIM_JOB_BUDGET_USD | no | no | no | optional | Default 2 |
| OPENAI_MODEL / DECISION_SIMULATION_OPENAI_MODEL | no | no | no | optional | Defaults to gpt-4o-mini |

Campaign-only variables such as `NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE` must not be used to identify this site.
