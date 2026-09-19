import { headers } from "next/headers";

export const AEAC_CANONICAL_HOST = "www.arelectionadvisory.org";
export const AEAC_APEX_HOST = "arelectionadvisory.org";
export const AEAC_CANONICAL_ORIGIN = `https://${AEAC_CANONICAL_HOST}`;

const AEAC_HOSTS = new Set([AEAC_CANONICAL_HOST, AEAC_APEX_HOST]);

export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

export function isAeacHost(host: string | null | undefined): boolean {
  return AEAC_HOSTS.has(normalizeHost(host));
}

export function aeacBaseForHost(host: string | null | undefined): string {
  return isAeacHost(host) ? "" : "/election-advisory";
}

export function aeacHref(base: string, path = ""): string {
  const suffix = path.replace(/^\//, "");
  if (!suffix) return base || "/";
  return `${base}/${suffix}`;
}

export async function getRequestHost(): Promise<string> {
  const headerList = await headers();
  return normalizeHost(headerList.get("x-forwarded-host") || headerList.get("host"));
}

export async function getAeacBase(): Promise<string> {
  return aeacBaseForHost(await getRequestHost());
}

export async function getAeacHref(path = ""): Promise<string> {
  return aeacHref(await getAeacBase(), path);
}

export function normalizeAeacPathname(pathname: string): string {
  if (pathname === "/election-advisory" || pathname === "/election-advisory/") return "/";
  if (pathname.startsWith("/election-advisory/")) {
    return pathname.slice("/election-advisory".length) || "/";
  }
  return pathname;
}
