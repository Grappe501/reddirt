# Vendor and address completion plan (bridge)

**Status:** Planning bridge — separate implementation pass.  
**Current flags:** 72 missing address entries from April expenditure inventory (identification only).

## Principle

**Never guess.** Addresses enter the system only after payee/vendor is confirmed from a primary source (W-9, invoice, check face, contract).

## Acceptable evidence

| Evidence | Use for |
| --- | --- |
| W-9 | Vendor legal name + address |
| Invoice / contract header | Vendor address |
| Check image (payee block) | Payee name; address if printed |
| Bank statement | Amount/date only — not vendor address by itself |

## Collection workflow

1. Complete **COMPLIANCE_APRIL_AUDIT_CHECKLIST.md** Part A and B first.
2. For each confirmed payee, open `/admin/compliance/vendors` (existing route).
3. Create or merge vendor record; enter address from evidence.
4. Re-run `npm run compliance:april-expenditure-inventory` and `compliance:ai-completion-engine`.

## Vendor variants

- Normalize spelling (e.g. `SQ *CAPACHI'S` vs `Capachi's Coffee`) as aliases on one vendor id.
- Do not merge until treasurer confirms same entity.

## Proposed vendor memory model (future)

- `ComplianceVendor` + alias table (display names from bank POS).
- Link receipt id, movement id, and ledger row id to vendor id.
- `addressVerifiedAt`, `addressSource` (w9 | invoice | check | manual).

## Filing blocker integration

- Filing stays **red** until expenditure disclosures have verified vendor addresses where required.
- `qa-filing` continues to count missing W-9 / vendor documentation separately.

## Commands

- `npm run compliance:april-audit-checklist`
- `npm run compliance:april-expenditure-inventory`
- `npm run compliance:weakness-discovery`
