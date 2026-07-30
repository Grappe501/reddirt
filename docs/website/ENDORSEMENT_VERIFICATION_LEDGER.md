# Endorsement verification ledger

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Canon:** `src/content/website/confirmed-endorsements.ts`  
**Campaign authority:** Steve-confirmed launch set (prior pass)  
**Production HTML proof:** `http://127.0.0.1:3457/endorsements` and homepage endorsements band

| ID | In canon | Homepage | Prod HTML | Announcement date | Public source URL | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| arkansas-afl-cio | ✅ | ✅ | ✅ name present | BLANK (correct) | BLANK (correct) | Working People; related photo with meeting≠endorsement note |
| arkansas-education-association | ✅ | ✅ | ✅ | BLANK | BLANK | Educators |
| josh-irby | ✅ | ✅ | ✅ | BLANK | BLANK | Community Leadership — individual endorsement |
| progressive-arkansas-women-pac | ✅ | ✅ | ✅ | BLANK | BLANK | Civic & Political Advocacy |

## Policy checks (production HTML)

| Check | Result |
| --- | --- |
| Coalition-first homepage intro (breadth, not ranking) | ✅ |
| `/endorsements` Campaign endorsement policy block | ✅ |
| AFL-CIO related photo note distinguishes meeting vs endorsement | ✅ |
| No logo wallpaper | ✅ |
| No invented quotes | ✅ |
| No inferred announcement dates in UI | ✅ |

## Engineering vs campaign

| Item | Owner |
| --- | --- |
| Names + coalition labels match campaign confirmation | Campaign approved; engineering encoded |
| Blank dates/URLs until supplied | Engineering correctly withholds |
| Adding a fifth endorsement | Campaign confirmation required first |
| Wording changes to descriptions | Campaign / editorial approval |

## Remaining verification (campaign, not engineering)

- Public announcement dates / source URLs when Steve supplies them  
- Optional approved quotes — withhold until approved
