# Post-additive schema Netlify readiness

**Machine JSON:** [`data/post-additive-schema-netlify-readiness.json`](../data/post-additive-schema-netlify-readiness.json)

**Netlify production retry** remains **out of scope** for this packet. This doc only records prerequisites so a **future** Steve-approved Netlify slice can proceed without conflating DB DDL with deploy retries.

## Prerequisites before any Netlify retry touching production

- Additive candidate applied and postcheck phase 1–2 satisfied.  
- Hosted read-only proof documented.  
- Separate approval for `migrate deploy` / build pipeline if applicable.
