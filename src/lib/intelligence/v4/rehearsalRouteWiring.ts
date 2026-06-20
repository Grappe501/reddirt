/** Kelly-facing rehearsal routes may mirror on election-plan portal. */
export function rehearsalRouteWired(href: string): boolean {
  return href.startsWith("/admin/intelligence") || href.startsWith("/election-plan/debate-prep");
}
