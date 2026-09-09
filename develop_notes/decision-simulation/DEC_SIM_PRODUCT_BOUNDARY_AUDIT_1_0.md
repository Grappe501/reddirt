# DEC-SIM product boundary audit 1.0

Date: 2026-09-09  
HEAD at audit start: `79b906656eb161c8099f296e14be80c143fd1a7e`

## Site ownership

| Surface | Netlify site | Hostname | Product |
|---|---|---|---|
| Decision Simulator | `dec-sim` | `dec-sim.netlify.app` | Advisory ensemble lab |
| Kelly SOS campaign | `kgrappe` | `kgrappe.netlify.app` | Public campaign site |

`dec-sim` is a standalone Netlify project pointed at `Grappe501/reddirt` `main`. It shares RedDirt code and the hosted Postgres used by Prisma. It is **not** the campaign website.

Detection (`src/lib/site/decision-sim-site.ts` + `scripts/netlify-site-mode.cjs`):

- `NEXT_PUBLIC_DECISION_SIM_SITE=1`, or
- `SITE_NAME` / `NETLIFY_SITE_NAME` equals `dec-sim`

`kgrappe` does not set those flags. `kgrappe` builds use the public-hub stash, not the dec-sim stash.

## Hostname / redirect behavior

On **dec-sim only**, `next.config.ts` adds a non-permanent redirect:

- `/` → `/admin/decision-simulator`

That block is gated by `decisionSimSite`. There is no hostname check that redirects `kgrappe` or `kellygrappe.com` to the simulator.

On **kgrappe**, `/` continues to serve the campaign public hub (`src/app/(site)`).

## What belongs to dec-sim

- `/admin/decision-simulator`
- `/admin/login` (passphrase gate for the simulator API)
- `/api/admin/decision-simulator/**`
- Decision Simulation engine under `src/lib/agents/decision-simulation/`
- Queue / job / chunk tables prefixed `decision_simulation_*`
- Server-side `OPENAI_API_KEY` consumption for advisory ensembles

## What does not belong to dec-sim

- Kelly SOS public homepage (`THE PEOPLE RULE`, Meet Kelly, Donate/Volunteer nav, campaign hero)
- Election Plan portal
- Campaign OS admin boards
- Autonomous email send or social posting
- Voter-file contact generation
- Hidden chain-of-thought storage

Build isolation: `DEC_SIM_STASH_DIRS` stashes `src/app/(site)` and the rest of the campaign App Router. Keep prefixes are only `src/app/admin/decision-simulator` and `src/app/admin/login`, plus `/api/admin/decision-simulator`.

## API / admin protection

- `assertAdminApi()` remains on simulator routes.
- Live OpenAI stays server-side.
- Unauthenticated `POST` to the run/jobs APIs must return 401.

## kgrappe safety

dec-sim-specific logic is flag/site-name gated. Campaign routing, homepage, and public-hub stash for `kgrappe` are unchanged when the dec-sim flag is off.
