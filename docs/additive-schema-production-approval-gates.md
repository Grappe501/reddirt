# Additive schema production approval gates

**Slice:** `REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0`  
**Machine JSON:** [`data/additive-schema-production-approval-gates.json`](../data/additive-schema-production-approval-gates.json)

All gates default **pending**. **Steve** must explicitly approve using the phrase in the JSON. **Netlify retry** and **live send** stay blocked by policy until separate slices.

## Required phrase

`STEVE_APPROVES_REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION`
