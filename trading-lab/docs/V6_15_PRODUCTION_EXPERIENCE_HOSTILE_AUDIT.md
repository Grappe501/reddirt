# V6-15 Production Experience Hostile Audit

Status: IMPLEMENTED — automated gate pending CI.

## Audit standard
Wealth Builder must make enormous depth feel simple. A novice should identify what matters and the next action quickly; an expert must be able to drill toward evidence, methodology, assumptions and simulation without leaving the product.

## Required gates
- Mobile-first shell remains usable at narrow widths without hiding primary navigation behind inaccessible controls.
- Keyboard focus is visible; interactive controls use native buttons/links or equivalent semantics.
- Reduced-motion preferences are respected.
- Minimum interactive target size is 44px on primary controls.
- Dashboard first frame answers performance, what happened, attention, current Wealth Builder research, and what to learn next without an agent/chart wall.
- Evidence strength is never described as probability of profit.
- Degraded production data is labeled rather than silently replaced with invented values.
- Research Floor summarizes investigations, sources and disagreement instead of exposing the internal agent organization as user burden.
- Competition surfaces preserve simulation-only, sealed-AI and human-directed-portfolio boundaries.
- Pending orders remain private until filled.
- 90-day reports do not claim investing skill from a short competition.
- Admin integrity signals require human review and immutable competition history remains protected.

## Performance budget
The V6 shell should remain dependency-light. Product surfaces are plain ES modules and CSS; avoid adding a UI framework merely for routing or presentation. Heavy research data must load on demand rather than blocking the first dashboard frame.

## Security and rendering debt
Several V6 product modules currently generate markup strings. Production wiring must treat external/provider/user strings as untrusted and escape or render them through DOM text nodes before live user data is allowed into those surfaces. This is a launch-blocking V6-16 proof item, not permission to trust arbitrary HTML.

## Result
V6-15 closes when automated tests prove the responsive/accessibility semantics and the above product invariants remain present. V6-16 must still prove production end-to-end wiring, safe rendering, live endpoint behavior, and deploy smoke before founding-cohort activation.
