# DEC-SIM-WORKER-CONTINUITY-1.0

**Status:** Phase 12 hardening capability. Not a Phase 12 close.  
**Accessed:** 2026-09-09

A queued 100/1,000 job no longer depends on the Mission Lab tab staying open.

After each chunk, the worker schedules the next `/work` call with `after()` and waits until that request is accepted. Chunks left `RUNNING` for two minutes are reclaimed. The dashboard only polls status.

Not in this slice: Netlify Background Functions, a standing cron on the campaign site, RBAC, audit log, privacy review. Filed as **V2-36**.
