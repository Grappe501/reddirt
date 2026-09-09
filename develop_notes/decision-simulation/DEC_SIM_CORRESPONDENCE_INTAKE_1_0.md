# Correspondence intake 1.0

**Slice:** `DEC-SIM-CORRESPONDENCE-INTAKE-1.0`  
**Phase:** 6 capability inside the open V1 spine. Not a phase close.

Paste-first. No mailbox connector. No attachment ingest.

The operator pastes a real artifact. If the paste includes channel headers (`From`, `Subject`, `Question`, `Re`, `Venue`), those fields are parsed and remain editable. Missing fields stay unknown. The body is the opening move. The simulator receives a compact intake packet and is told not to invent recipients, venues, or questions.

Connectors stay disabled until the core simulator is stable.
