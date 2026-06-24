import insightFile from "../../../data/volunteers/cluster-insight.source.json";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";

const registry = insightFile as {
  clusters: Record<
    string,
    {
      name: string;
      regionHref: string;
      countySlugs: string[];
    }
  >;
};

export type ClusterInsightConfig = (typeof registry.clusters)[string];

export function getClusterInsight(slug: string): ClusterInsightConfig | undefined {
  return registry.clusters[slug];
}

export type ClusterInsightLink = {
  label: string;
  href: string;
  description: string;
};

/** Read-only cluster rollup links — geography context without cluster manager tier. */
export function resolveClusterInsightLinks(slug: string): ClusterInsightLink[] {
  const cluster = getClusterInsight(slug);
  if (!cluster) return [];

  const links: ClusterInsightLink[] = [
    {
      label: cluster.name,
      href: cluster.regionHref,
      description: "Cluster geography and regional rollup — read-only context for your lane.",
    },
  ];

  for (const countySlug of cluster.countySlugs) {
    const countyName = countySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    links.push({
      label: `${countyName} County playbook`,
      href: countyPlaybookHref(countyName, countySlug),
      description: `Cluster county drill-down — ${cluster.name}`,
    });
  }

  return links;
}
