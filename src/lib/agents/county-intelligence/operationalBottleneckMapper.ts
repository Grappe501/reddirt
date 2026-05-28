import { loadOperationalBottleneckMap } from "./executiveCommandStateBuilder";

export function operationalBottleneckMapper(countySlug: string) {
  const row = loadOperationalBottleneckMap().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    bottlenecks: row?.bottlenecks ?? ["MISSING bottleneck row"],
    pressureScore: row?.pressureScore ?? 0,
    label: row?.label ?? "SIGNAL",
    status: row?.status ?? "MISSING",
  };
}

