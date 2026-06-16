# End-of-pass Git commit and push

**Required for every agent pass** that changes files in this repo.

## Rule

Do not hand off uncommitted work. Every pass ends with:

1. Verify checks (`npm run typecheck`; `npm run stack:migrate` if schema/migrations changed; `npm run election-plan:build` if election-plan data changed).
2. `git status` / `git diff` — refuse to commit if secrets would be staged.
3. `git add` (lane scope only), `git commit`, `git push -u origin HEAD`.
4. Report **branch**, **commit hash**, and **push status** in the pass summary.

Skip commit/push only when the tree is clean and the branch is already up to date with `origin`.

## Hard stops

- Secrets in staged files
- `stack:migrate` failure after schema changes
- Same test failed twice after repair

## Netlify

Production builds run `scripts/netlify-build.sh` (`prisma migrate deploy` → `election-plan:build` → `next build`). Pushing migrations + schema in the same commit as app code keeps hosted DB aligned with deploys.

Cursor workspace mirror: `H:\SOSWebsite\.cursor\rules\end-of-pass-github.mdc`
