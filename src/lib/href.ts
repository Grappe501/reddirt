/** True for absolute http(s) links (open in new tab from campaign UI where appropriate). */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}
