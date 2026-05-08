export { normalizeEmail, extractDomain, parseEmailAddressList, type ParsedEmailAddress } from "./email-address";
export { normalizePhone } from "./phone";

export function splitDisplayName(name: string | null | undefined): { firstName?: string; lastName?: string } {
  if (!name?.trim()) return {};
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return { firstName: p[0] };
  return { firstName: p[0], lastName: p.slice(1).join(" ") };
}
