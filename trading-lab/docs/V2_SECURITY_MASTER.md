# V2-07 — Security Master

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

The Security Master replaces ticker-as-string thinking with stable security identity.

A security record separates the tradable listing from the issuer and stores asset class, primary listing, currency, country, classification, identifiers/provider mappings, aliases, education links and provenance.

The first seed proves equities and ETFs using NVDA, AAPL, MSFT, SPY and QQQ. These records are deliberately DRAFT/UNSOURCED until an authoritative metadata ingestion/review pass verifies mutable company/listing facts. The runtime must not present draft classification as verified fact.

securityBySymbol() and securityIdentity() give downstream systems one canonical resolver. securityHoverCard() creates the data contract for the upcoming symbol hover experience while keeping live price/change context separate from stable identity.

Future expansion should ingest identifiers such as CIK/FIGI/ISIN/CUSIP only from appropriate authoritative/licensed sources and preserve source provenance. Provider-specific ticker mappings belong in identifiers.providerSymbols; provider naming must never become the canonical identity.

Security Master is the prerequisite for Universal Symbol Intelligence Pages, fundamentals/filings, portfolio exposure, corporate actions and multi-asset support.
