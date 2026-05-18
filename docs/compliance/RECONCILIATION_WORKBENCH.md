# Reconciliation workbench

## Routes

- `/admin/compliance/reconciliation`
- `/admin/compliance/reconciliation/[matchId]`

## Actions (`reconciliation-actions.ts`)

approve, force match, split, ignore bank transaction, mark transfer, record variance, lock, unlock (with reason).

## Lock model (`reconciliation-locks.ts`)

A match is not filing-ready until human approved, audit log written, and status `locked` or intentionally `ignored`.

## Audit (`reconciliation-audit.ts`)

All state changes append to reconciliation audit storage for treasurer review.
