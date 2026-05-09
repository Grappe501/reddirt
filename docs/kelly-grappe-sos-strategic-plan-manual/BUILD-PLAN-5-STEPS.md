# Campaign Strategy manual — 5-step online build plan

**Goal:** One canonical narrative in `docs/kelly-grappe-sos-strategic-plan-manual/`, with **full depth** in the RedDirt admin reader (`/admin/campaign-strategy`) so you can read on any device, tweak copy in Git all week, and share stable links with Kelly — without maintaining a parallel “summary” in TypeScript.

**Principle:** Edit Markdown in this folder only; the admin surface **loads these files** (not a hand-maintained duplicate).

---

## Step 1 — Link + render (foundation)

**Ship:** Server-side read of manual `.md` files, canonical path manifest, GitHub-flavored Markdown (tables, lists), reading typography aligned to Kelly admin styling; nav and breadcrumbs driven from the same manifest. Internal links that point at sibling `.md` files resolve to `/admin/campaign-strategy/...` routes.

**Done when:** Every file in the manual inventory (except intentional placeholders) opens in the admin UI with full Markdown body and matches the repo after a save + deploy (or local refresh).

---

## Step 2 — Reading experience polish

**Ship:** Mobile-first spacing, max line length, comfortable scroll; optional “reader” focus (hide chrome / reduce distraction) if needed; anchor-friendly headings for deep links; print stylesheet or “print to PDF” friendly layout for sharing packets.

**Plus (agent / RAG):** Authenticated chunk index + retrieval API at `GET /api/admin/campaign-strategy/chunks` (filter by `pathKey`, fetch one chunk by `id`, add `include=body` for Markdown). Chunk ids align with GitHub-style heading anchors in the reader.

**Done when:** You can read comfortably in bed on a phone; long chapters (LANE, compliance) stay legible; sharing a URL lands on the right section where headings allow; an internal agent can enumerate and pull chunk text without scraping HTML.

---

## Step 3 — Share-with-Kelly workflow

**Ship:** Clear **classification** strip (internal / redact externally); copy-friendly “link to this chapter”; short operator note on what to **not** forward (e.g. LANE dollar detail). Optional: “external-safe excerpt” mode that hides flagged pages or replaces LANE with a stub (only if product needs it).

**Done when:** Kelly can receive specific chapter links; external risk is documented in-product, not only in prose.

**Status (implemented):** Persistent **Share protocol** banner on `/admin/campaign-strategy`; toolbar **Copy page link** uses full URL **including hash**; **Copy external-safe link** adds `?share=external`; **LANE** chapter in that mode renders a stub instead of dollar/victory body. README documents sharing.

---

## Step 4 — Content completeness pass (nothing unturned)

**Ship:** Chapter-by-chapter audit against the manual: missing subsections, todos, tables, cross-links, and appendix references; fix gaps in **Markdown** (not in TS stubs). County workbench “future” page either links out to `countyWorkbench` docs per integration rules or stays a labeled placeholder.

**Done when:** No chapter is outline-only unless explicitly marked TODO in the manual frontmatter.

**Status (implemented):** County workbench placeholder includes an explicit **gold callout** pointing to `countyWorkbench/docs/COUNTY_WORKBENCH_MASTER_PLAN.md` (text path only; no cross-lane imports). `npm run strategy-manual:verify` runs a **non-fatal content depth audit** (short files, TODO/FIXME markers) and prints warnings.

---

## Step 5 — Hardening + tweak loop

**Ship:** Build-time verification (optional script): every manifest entry’s file exists; no broken internal `.md` links; CI-friendly check. Process note for the team: **edit → PR → merge** as the sole content pipeline for this manual.

**Done when:** From `RedDirt/`, `npm run strategy-manual:verify` passes (all manifest files present, every chapter produces at least one chunk, **all relative `.md` links in the manual folder resolve**). **`npm run check`** runs this verify first. Week-long iteration is Markdown-only.

**Status (implemented):** `verify-manual-links.ts` + verify script; `check` script invokes verify.

---

**Current status:** Steps 1–5 for this slice are implemented in RedDirt. Iterate manual text in `docs/kelly-grappe-sos-strategic-plan-manual/` only; run `npm run check` before deploy.
