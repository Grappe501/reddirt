import { buildCampaignSystemChunkEntries } from "./campaign-system-md-discovery";

export type CampaignSystemCategoryId =
  | "root-tomes"
  | "chapters"
  | "playbooks"
  | "roles"
  | "workflows"
  | "inventories"
  | "maps"
  | "web-presentation";

export type CampaignSystemNavItem = {
  pathKey: string;
  label: string;
  sourceFile: string;
  categoryId: CampaignSystemCategoryId;
};

export type CampaignSystemNavSection = {
  id: CampaignSystemCategoryId;
  title: string;
  items: CampaignSystemNavItem[];
};

export const CAMPAIGN_SYSTEM_CATEGORY_LABELS: Record<CampaignSystemCategoryId, string> = {
  "root-tomes": "Root strategy tomes",
  chapters: "Manual chapters",
  playbooks: "Playbooks & SOPs",
  roles: "Role guides",
  workflows: "Workflows",
  inventories: "Inventories & indexes",
  maps: "System maps",
  "web-presentation": "Web presentation",
};

export const CAMPAIGN_SYSTEM_MANUAL_HUB_HREF = "/admin/intelligence/campaign-system-manual";

export function categoryIdFromRelativePath(relPath: string): CampaignSystemCategoryId {
  if (!relPath.includes("/")) return "root-tomes";
  const top = relPath.split("/")[0]!;
  if (top in CAMPAIGN_SYSTEM_CATEGORY_LABELS) {
    return top as CampaignSystemCategoryId;
  }
  return "root-tomes";
}

export function campaignSystemDocHref(pathKey: string): string {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return key ? `${CAMPAIGN_SYSTEM_MANUAL_HUB_HREF}/${key}` : CAMPAIGN_SYSTEM_MANUAL_HUB_HREF;
}

export async function buildCampaignSystemNav(): Promise<CampaignSystemNavSection[]> {
  const entries = await buildCampaignSystemChunkEntries();
  const sections = new Map<CampaignSystemCategoryId, CampaignSystemNavItem[]>();

  for (const entry of entries) {
    const pathKey = entry.path.replace(/^campaign-system\//, "");
    const categoryId = categoryIdFromRelativePath(entry.file);
    const list = sections.get(categoryId) ?? [];
    list.push({
      pathKey,
      label: entry.label.replace(/^Campaign system · /, ""),
      sourceFile: entry.file,
      categoryId,
    });
    sections.set(categoryId, list);
  }

  const order: CampaignSystemCategoryId[] = [
    "root-tomes",
    "chapters",
    "playbooks",
    "roles",
    "workflows",
    "inventories",
    "maps",
    "web-presentation",
  ];

  return order
    .map((id) => ({
      id,
      title: CAMPAIGN_SYSTEM_CATEGORY_LABELS[id],
      items: (sections.get(id) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .filter((s) => s.items.length > 0);
}
