# V2-03 — Universal Explain UI

Status: IMPLEMENTATION CONTRACT
Date: 2026-09-18

Universal Explain UI renders any Universal Knowledge Object as progressive disclosure without forcing the learner to leave the Trading Lab.

Desktop: hover or keyboard focus reveals GLANCE; click opens the explanation drawer.
Touch/mobile: tap opens the drawer; hover is never required.
Keyboard: semantic button trigger, visible focus, Escape close.
Drawer depths: Quick, Explain, Learn, Advanced, Research, Try It.
Unavailable deeper content degrades honestly rather than generating unsupported material.

Integration contract: a reusable knowledge trigger receives a UKO id plus optional display label and contextual live value. Canonical definitions come from the UKO store; live values remain separate contextual observations.

Accessibility: meaning never depends on hover or color. Dialog semantics, labeled close control, visible focus, Escape dismissal, mobile full-width layout and reduced-motion behavior are required.

Initial proving integration: VWAP in Market + Analytics. Broad automatic annotation waits for V2-04 Knowledge Graph.
