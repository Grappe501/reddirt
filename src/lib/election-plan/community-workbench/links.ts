export function communityWorkbenchHubHref(): string {
  return "/election-plan/workbenches";
}

export function communityWorkbenchHref(slug: string): string {
  return `/election-plan/workbenches/${slug}`;
}

export function communityWorkbenchSearchHref(query?: string): string {
  if (!query?.trim()) return `${communityWorkbenchHubHref()}?focus=search`;
  return `${communityWorkbenchHubHref()}?q=${encodeURIComponent(query.trim())}`;
}
