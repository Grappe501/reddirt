import { buildCampaignSystemChunkEntries } from "./campaign-system-md-discovery";
import {
  CAMPAIGN_SYSTEM_CATEGORY_LABELS,
  categoryIdFromRelativePath,
  type CampaignSystemCategoryId,
  type CampaignSystemNavItem,
  type CampaignSystemNavSection,
} from "./campaign-system-nav-shared";

export type { CampaignSystemCategoryId, CampaignSystemNavItem, CampaignSystemNavSection } from "./campaign-system-nav-shared";
export {
  CAMPAIGN_SYSTEM_CATEGORY_LABELS,
  CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  campaignSystemDocHref,
  categoryIdFromRelativePath,
} from "./campaign-system-nav-shared";

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
