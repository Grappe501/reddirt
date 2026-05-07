# Migration dependency repair (REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0)

## Problem

`20260505203000_email_contact_profile_graph` originally could not add a foreign key to **`RelationalContact`** before that table existed in the migration order.

## Repair (in repo)

1. **Email graph migration** — `EmailContactProfile.relationalContactId` column remains, but the **`EmailContactProfile_relationalContactId_fkey`** constraint is **not** created there (see comment referencing REL-2 and the follow-up migration).
2. **REL-2** — `20260515120000_rel2_relational_contact_foundation` creates **`RelationalContact`**.
3. **Deferred FK** — `20260515121000_email_contact_profile_relational_contact_fkey` adds **`EmailContactProfile_relationalContactId_fkey`** referencing **`RelationalContact`(`id`)**.

Lexical migration folder order: **`20260515120000_*` before `20260515121000_*`**.

## Machine validation

```text
cd RedDirt
node scripts/validate-migration-dependency-repair.mjs
```

Writes [`data/migration-dependency-repair-validation.json`](../data/migration-dependency-repair-validation.json). **`safeForProductionDeploy`** remains **`false`** in that artifact — production is still human-gated.
