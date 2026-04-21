export function pathToHref(path: string): string {
  if (path.startsWith("route:")) {
    const rest = path.slice("route:".length);
    return rest.length ? rest : "/";
  }
  return "/resources";
}
