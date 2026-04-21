/**
 * Best-effort E.164 normalization for US numbers (campaign default).
 * Store consistently so inbound/outbound matching works.
 */
export function normalizeUsPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits.replace(/^\+/, "")}`;
  return null;
}
