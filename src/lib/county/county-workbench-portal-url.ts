/**
 * Sister app: county coordination hub (`countyWorkbench/` in the monorepo — own Netlify site).
 * Set `NEXT_PUBLIC_COUNTY_WORKBENCH_URL` in Netlify (RedDirt site) to surface admin + copy links.
 */
export function getCountyWorkbenchPortalUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_COUNTY_WORKBENCH_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}
