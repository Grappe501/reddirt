# Public Statistics Source Hierarchy

## Authority order (general)

1. Official agency primary statistical product for the concept
2. Official agency corroborating product (different survey/admin design)
3. Derived calculations from primary products (documented formula)
4. Secondary compilations (use only with disclosure)

## Agency notes

| Agency | Strength | Caution |
|---|---|---|
| Census ACS | Demographic/income/housing estimates with MOE | 1-Year vs 5-Year incompatibility |
| BLS LAUS/CPS/QCEW/CPI | Labor market & prices | Seasonal adjustment; survey vs admin |
| BEA | Income/GDP concepts | Not interchangeable with ACS income |
| USDA/FCC/CDC/etc. | Domain-specific | Definition and geography fit |

## Preferred source

Each metric mapping records `preferredSource` and optional `corroboratingSourceIds`. Preferred source wins for display value; corroboration affects confidence, not silent averaging.
