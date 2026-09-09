# DEC-SIM-STALE-RUNNING-RECLAIM-1.0

**Status:** Phase 5 / 12 hosted-job unstick. Not a Phase 5 close.  
**Accessed:** 2026-09-09

A queued chunk left `RUNNING` with a null or stale `claimed_at` returns to the worker. Retry also resets those rows. The dashboard can send a stuck chunk back to the queue without SQL.

The first hosted 100 (`ce565e97-cd3d-48a6-9f53-d19cb6e12fb7`) finished 91 / 9 with all six futures and within-lane n of 12. That snapshot is informative. Phase 5 stays open until the live badge reads `PROVEN`.

Not in this slice: a dedicated background worker, function work that outlives the HTTP request, or auto-canary 100s. Filed as **V2-36** / **V2-40** / **V2-37**.
