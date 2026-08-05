# RCIP Connector Roadmap

Phase 1 implements Census + BLS only. Do not implement all connectors in this slice.

| Priority | Connector | Likely datasets | Auth | Public value | Overlap / cross-check | Legal/reuse | Status |
|---|---|---|---|---|---|---|---|
| 1 | Census | ACS 5-Year | API key | Demographics, income, poverty, housing | vs BLS labor concepts | Public API ToS | Phase 1 |
| 2 | BLS | LAUS, CPS, CPI, QCEW | API key | Labor, wages, prices | vs ACS employment | Public API ToS | Phase 1 |
| 3 | BEA | Regional income/GDP | key/public | Macro income concepts | vs ACS income | Terms check | Phase 2 candidate |
| 4 | USDA | Rural/ag indicators | public/key | Rural economy | limited | Terms check | Phase 2 candidate |
| 5 | FCC | Broadband | public | Connectivity | vs ACS broadband | Terms check | Phase 2 candidate |
| 6 | CDC | Public health | public | Health baselines | domain-specific | Terms check | Later |
| 7 | CMS | Health coverage/cost | public | Insurance | vs Census | Terms check | Later |
| 8 | ED | Education | public | Attainment outcomes | vs ACS education | Terms check | Later |
| 9 | Treasury/IRS SOI | Fiscal/tax stats | public | Fiscal baselines | careful geography | Terms check | Later |
| 10 | EPA/EIA | Environment/energy | public | Domain baselines | limited | Terms check | Later |
| 11 | DOJ | Justice stats | public | Safety baselines | careful interpretation | Terms check | Later |
| 12 | AR DFA / labor / education / health / transportation | State products | varies | Arkansas-specific | vs federal | State ToS | Later |
| — | FRED | Aggregations | key | Convenience | prefer primary agencies | Terms permit? | Evaluate |

Next recommended slice after Phase 1 proof: `RCIP-PHASE-2-MULTI-AGENCY-CONNECTOR-EXPANSION-1.0` starting with BEA/USDA/FCC based on CC baseline gaps.
