# RCIP Rollback Plan

## Application code

Revert the RCIP commit(s) on the working branch. No campaign schema changes should exist in RCIP commits.

## Database

If `public_statistics` migration applied:

1. Drop only `public_statistics` objects created by the migration (schema or prefixed tables)
2. Do not touch campaign/people/auth tables
3. Preserve raw archives on H: unless operator explicitly purges

## Exports / CC imports

1. Mark export `status: revoked` in metadata if recorded
2. In CC: remove or quarantine imported snapshot; restore prior baseline sourced counts
3. Do not leave failed/stale imports on public surfaces

## Keys

Rotate keys only if leakage suspected; never commit keys.
