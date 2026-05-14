# Agent Missing Data Report

Generated: 2026-05-14T04:11:13.353Z

1. **MEDIUM / materials**: Unknown on-hand inventory: push_cards
   Fix: Count inventory and update campaign-materials-inventory.json.
2. **MEDIUM / materials**: Unknown on-hand inventory: fans
   Fix: Count inventory and update campaign-materials-inventory.json.
3. **HIGH / materials**: Unknown on-hand inventory: branded_mints
   Fix: Count inventory and update campaign-materials-inventory.json.
4. **MEDIUM / materials**: Unknown on-hand inventory: kelly_shirts
   Fix: Count inventory and update campaign-materials-inventory.json.
5. **MEDIUM / materials**: Unknown on-hand inventory: signup_sheets
   Fix: Count inventory and update campaign-materials-inventory.json.
6. **MEDIUM / materials**: Unknown on-hand inventory: clipboards
   Fix: Count inventory and update campaign-materials-inventory.json.
7. **MEDIUM / materials**: Unknown on-hand inventory: pens
   Fix: Count inventory and update campaign-materials-inventory.json.
8. **MEDIUM / materials**: Unknown on-hand inventory: qr_code_cards
   Fix: Count inventory and update campaign-materials-inventory.json.
9. **HIGH / coverage**: 57 events missing volunteer lead
   Fix: Assign volunteer leads or create approved callout queue.
10. **HIGH / coverage**: 24 events missing table permission
   Fix: Staff table-permission calls and update coverage plan status.
11. **HIGH / volunteer**: 210 events need callout
   Fix: Review and approve staged volunteer callout drafts.
12. **MEDIUM / calendar**: Campus/football/EHC/AEA context missing
   Fix: Add source data for campus, football, EHC, and AEA event rules.
13. **HIGH / calendar**: 111 CampaignEvents missing county link
   Fix: Run county relink review queue; do not auto-link ambiguous rows.
14. **MEDIUM / calendar**: 185 CampaignEvents missing location
   Fix: Add location enrichment/review pass.
15. **HIGH / google**: Google OAuth anchor source missing
   Fix: Create/select CalendarSource with refresh token, then run Google lane smoke test.
