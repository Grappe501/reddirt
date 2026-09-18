# V2 Release Proof Trigger

This branch exists to force the pull-request CI path for the Trading Lab V2 hostile audit. It does not change runtime behavior.

Release remains HOLD until the clean CI job proves `npm ci`, `npm run audit:v2`, and the Vite `dist/index.html` artifact.
