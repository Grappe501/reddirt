# AI Dashboard Builder

**Path:** `src/lib/agents/dashboard-builder/`

Pipeline: **interpret → registry filter → safety guard → layout plan → blueprint**

Produces `DashboardBlueprint` with preview cards, routes, do-not-touch list — **no arbitrary React code generation**.

Example requests supported via `dashboard-request-interpreter.ts`.

Save: optional `localStorage` key from blueprint `saveKey`.
