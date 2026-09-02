/**
 * Campaign-reported completed stops that are not yet their own ledger rows.
 *
 * As of 2026-09-02 the dated public ledger has 214 completed stops. Field count is 241
 * (214 + this constant). Do not treat newly dated rows as one of the 27 unless Steve says so.
 * The gap is same-day / same-town (and other unposted) stops that never got a separate
 * calendar line. Reconcile later: when you add one of those missing stops to the ledger,
 * decrement this number by 1 so the public total does not double-count.
 *
 * Do not invent dates, cities, or venues for these.
 */
export const UNPOSTED_COMPLETED_STOPS_PENDING_RECONCILE = 27;
