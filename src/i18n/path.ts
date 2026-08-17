import type { AppLocale } from "@/i18n/types";

const ES_PREFIX = "/es";

export function isSpanishPath(pathname: string): boolean {
  return pathname === ES_PREFIX || pathname.startsWith(`${ES_PREFIX}/`);
}

export function localeFromPathname(pathname: string): AppLocale {
  return isSpanishPath(pathname) ? "es" : "en";
}

/** Path without `/es` prefix. The `/es` hub stays `/es` (it is not an English homepage clone). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === ES_PREFIX || pathname === `${ES_PREFIX}/`) return ES_PREFIX;
  if (pathname.startsWith(`${ES_PREFIX}/`)) {
    const rest = pathname.slice(ES_PREFIX.length);
    return rest || "/";
  }
  return pathname;
}

export const ENGLISH_ONLY_PATH_PREFIXES = [
  "/from-the-road",
  "/press-coverage",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/accessibility",
  "/admin",
] as const;

export function isEnglishOnlyPath(pathname: string): boolean {
  const p = stripLocalePrefix(pathname);
  return ENGLISH_ONLY_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

/** Pages with approved/native-review Spanish body copy this release. */
export const SPANISH_CONTENT_PATHS = [
  "/es",
  "/voter-registration",
  "/voter-registration/assistance",
  "/get-involved",
  "/volunteer",
  "/schedule",
  "/events/request",
  "/events/request/how-it-works",
  "/events/request/what-you-can-host",
] as const;

export function hasSpanishContent(pathname: string): boolean {
  const p = stripLocalePrefix(pathname);
  if (p === "/es") return true;
  return SPANISH_CONTENT_PATHS.some((route) => route !== "/es" && (p === route || p.startsWith(`${route}/`)));
}

function splitHashQuery(href: string): { path: string; query: string; hash: string } {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const qIndex = withoutHash.indexOf("?");
  const query = qIndex >= 0 ? withoutHash.slice(qIndex) : "";
  const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  return { path, query, hash };
}

export function withLocaleHref(href: string, locale: AppLocale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { path, query, hash } = splitHashQuery(href);
  if (locale === "en") {
    if (path === ES_PREFIX) return `/voter-registration${query}${hash}`;
    if (path.startsWith(`${ES_PREFIX}/`)) return `${path.slice(ES_PREFIX.length)}${query}${hash}`;
    return href;
  }
  if (isEnglishOnlyPath(path)) return href;
  if (path === ES_PREFIX || path.startsWith(`${ES_PREFIX}/`)) return href;
  if (path === "/") return `${ES_PREFIX}${query}${hash}`;
  return `${ES_PREFIX}${path}${query}${hash}`;
}

/** Español control: same page if it has Spanish copy, otherwise the /es voter hub. */
export function spanishEntryHref(currentPathname: string): string {
  const canonical = stripLocalePrefix(currentPathname);
  if (canonical === ES_PREFIX || hasSpanishContent(canonical)) {
    return withLocaleHref(canonical === ES_PREFIX ? ES_PREFIX : canonical, "es");
  }
  return ES_PREFIX;
}
