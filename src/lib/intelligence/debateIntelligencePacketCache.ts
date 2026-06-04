/**
 * In-process cache for debate intelligence packets.
 * Warm Netlify lambdas reuse parsed JSON/markdown within the same instance.
 */
const packetCache = new Map<string, unknown>();

export function getCachedDebatePacket<T>(key: string, build: () => T): T {
  const hit = packetCache.get(key);
  if (hit !== undefined) return hit as T;
  const value = build();
  packetCache.set(key, value);
  return value;
}

/** Test-only — clears module cache between assertions. */
export function clearDebateIntelligencePacketCache(): void {
  packetCache.clear();
}
