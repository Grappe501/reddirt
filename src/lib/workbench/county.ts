/**
 * Workbench query params: restrict county filter to real published county ids
 * to avoid Prisma `where: { countyId: 'nonsense' }` and confusing empty UIs.
 */
export function resolveWorkbenchCountyId(
  raw: string | null | undefined,
  validIds: ReadonlySet<string>
): { countyId: string | null; invalidParam: boolean } {
  const t = raw?.trim() || null;
  if (!t) return { countyId: null, invalidParam: false };
  if (validIds.has(t)) return { countyId: t, invalidParam: false };
  return { countyId: null, invalidParam: true };
}

/** Basic guard: CUID1 / nanoid length — avoids random long strings in Prisma. */
const THREAD_ID_RE = /^[a-z0-9_-]{1,64}$/i;
export function isPlausibleId(id: string | null | undefined): boolean {
  if (!id?.trim()) return false;
  return THREAD_ID_RE.test(id.trim());
}
