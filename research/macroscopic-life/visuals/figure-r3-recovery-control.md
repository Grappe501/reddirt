# Figure R3 Recovery Control — R15

**Status:** INVENTORY COMPLETE; PRODUCTION CLOSURE NOT IMPLIED

**Rule:** RECOVER THE APPROVED PRODUCTION BINARY. DO NOT REDESIGN AN APPROVED FIGURE TO SATISFY A FILE GATE.

| Gate | Result |
|---|---:|
| Figures inventoried | 15/15 |
| Lock commits found | 15/15 |
| Figures with current candidate assets | 0/15 |
| Figures with historical-only candidate assets | 0/15 |
| Figures missing/unverified | 15/15 |
| Publication registry physically present before recovery | NO |
| Figure R3 closure | NOT YET AUTHORIZED |
| R15 full PASS | NOT YET AUTHORIZED |

## Per-figure inventory

| Figure | Approved version | Lock commit | Commit found | Current candidates | Historical candidates | Status |
|---:|---|---|---:|---:|---:|---|
| 2 | V4 | `786b9dec0e763906198954c8b6b5b2b723321730` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 3 | V4 | `681159c5f3cc2b988c58d52627b48d749e695027` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 4 | V4 | `ce516935f999e52decc3e2561a048f5896e5383c` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 5 | V3 | `90e4dccf0e90471190b73968634df982b6ddde73` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 6 | V3 | `c276a9e9ba211a07c487d70379625b734898780a` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 7 | V3 | `76149c8c8ce1ee9c61fb2cb03ee9e925a57de9bc` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 8 | V2 | `30885f9e1980cc32075f1d42b3edf9196a24cfac` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 9 | V2 | `7cbf92241d851e08a6ddf0e18f00660f86587de0` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 10 | V3 | `7350f0edfe7817fb969796c5150b604dd693a9ab` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 11 | V2 | `e0c839a341759bbab894f6ce3442d004915fe0b3` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 12 | V3 | `51fe578231eb0a70960b4c29c8106b90a37c2584` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 13 | V3 | `8834c60209e50e88febb48dabe77007a8b291830` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 14 | V3 | `97007d01dcdc8aaf2cd2a287a81e8204736688d3` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 15 | V3 | `69f59749f701213f4ee63c7c98b8b49578debbcf` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |
| 16 | FROZEN | `3178eaf81abd53c42ab613316e144907c6736b65` | YES | 0 | 0 | MISSING_OR_UNVERIFIED |

## Interpretation

A current or historical candidate is not automatically the approved production binary. Blob/path evidence must be reconciled with the approved lock record before recovery. No image is generated, modified, substituted, or redesigned by this inventory.
