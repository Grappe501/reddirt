export const CITY_SPIKE_HITS = 5;
export const CITY_SPIKE_COOLDOWN_MS = 60 * 60 * 1000;

export function shouldSendCitySpike(input: {
  hits: number;
  threshold?: number;
  lastSentAt: number | null;
  now: number;
  cooldownMs?: number;
}): boolean {
  const threshold = input.threshold ?? CITY_SPIKE_HITS;
  const cooldown = input.cooldownMs ?? CITY_SPIKE_COOLDOWN_MS;
  if (input.hits < threshold) return false;
  if (input.lastSentAt != null && input.now - input.lastSentAt < cooldown) return false;
  return true;
}

export function sanitizeIntakeNote(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 500);
}
