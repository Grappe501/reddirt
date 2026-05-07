# Unsafe production schema diff analysis

## **The raw Prisma diff is not safe to execute.**

**Slice:** `REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0`  
**Generated:** 2026-05-07T04:41:51.835Z  
**Machine JSON:** [`data/unsafe-production-schema-diff-analysis.json`](../data/unsafe-production-schema-diff-analysis.json)

## Source

- **Found:** yes
- **Path used:** `data\sql\unsafe-production-to-current-schema-diff.sql`
- **Temp fallback checked:** `C:\Users\User\AppData\Local\Temp\reddirt-production-to-current-schema-diff.sql`

## Summary counts

| Metric | Value |
|--------|------:|
| Statements | 1332 |
| CREATE TYPE | 171 |
| CREATE TABLE | 145 |
| ALTER TABLE | 433 |
| CREATE INDEX | 438 |
| DROP (token hits) | 262 |
| TRUNCATE | 0 |
| DELETE FROM | 0 |
| ALTER auth.* | 18 |
| ALTER storage/realtime/vault | 0 |
| Legacy public DROP CONSTRAINT (heuristic) | 11 |

## Recommendation

**Raw diff safe to execute:** **No** — Raw diff contains destructive or provider mutations (drops=262, alters=433, auth/provider alters=18, legacy constraint drops=11).

**Next step:** Build curated additive-only SQL candidate.

## High-risk findings (deduped, capped)

- Statement 171: ALTER TABLE auth.*
- Statement 171: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 172: ALTER TABLE auth.*
- Statement 172: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 173: ALTER TABLE auth.*
- Statement 173: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 174: ALTER TABLE auth.*
- Statement 174: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 175: ALTER TABLE auth.*
- Statement 175: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 176: ALTER TABLE auth.*
- Statement 176: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 177: ALTER TABLE auth.*
- Statement 177: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 178: ALTER TABLE auth.*
- Statement 178: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 179: ALTER TABLE auth.*
- Statement 179: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 180: ALTER TABLE auth.*
- Statement 180: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 181: ALTER TABLE auth.*
- Statement 181: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 182: ALTER TABLE auth.*
- Statement 182: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 183: ALTER TABLE auth.*
- Statement 183: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 184: ALTER TABLE auth.*
- Statement 184: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 185: ALTER TABLE auth.*
- Statement 185: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 186: ALTER TABLE auth.*
- Statement 186: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 187: ALTER TABLE auth.*
- Statement 187: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 188: ALTER TABLE auth.*
- Statement 188: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 189: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 190: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 191: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 192: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 193: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 194: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 195: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 196: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 197: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 198: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 199: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 200: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 201: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 202: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 203: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 203: legacy public table constraint drop: events
- Statement 204: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 204: legacy public table constraint drop: events
- Statement 205: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 205: legacy public table constraint drop: events
- Statement 206: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 206: legacy public table constraint drop: events
- Statement 207: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 208: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 209: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 210: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 211: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 212: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 213: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 214: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 215: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 216: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 217: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 218: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 219: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 220: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 221: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 222: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 223: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 224: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 225: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 226: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 227: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 228: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 228: legacy public table constraint drop: message_events
- Statement 229: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 230: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 231: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 232: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 233: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 234: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 235: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 236: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 237: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 238: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 239: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 240: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 241: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 242: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 243: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 243: legacy public table constraint drop: person_profiles
- Statement 244: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 245: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 246: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 246: legacy public table constraint drop: profiles
- Statement 247: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 248: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 249: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 250: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 251: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 252: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 253: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 254: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 255: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 256: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 257: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 258: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 259: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 260: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 261: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 262: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 263: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 264: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 264: legacy public table constraint drop: turf_people
- Statement 265: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 265: legacy public table constraint drop: turf_people
- Statement 266: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 267: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 268: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 269: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 270: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 271: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 272: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 272: legacy public table constraint drop: voter_profiles
- Statement 273: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 274: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 275: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 276: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 277: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 278: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 279: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 280: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 281: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 282: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 283: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 284: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 287: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 287: legacy public table constraint drop: counties
- Statement 288: ALTER TABLE … DROP (non NOT NULL/DEFAULT)
- Statement 289: ALTER TABLE … DROP (non NOT NULL/DEFAULT)

## Unsafe samples (capped)

See JSON `unsafeSamples` for machine-readable previews.

## Governance

This packet **does not** execute SQL against production, **does not** baseline production, and **does not** run Prisma migrate against production.
