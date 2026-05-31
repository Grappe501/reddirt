import type { HumanActionOwnerRole, HumanActionQueueItem } from "@/lib/intelligence/types/humanActionQueue";

/** Filter action queue items by operator role tab (client-safe). */
export function filterActionsForRole(
  items: HumanActionQueueItem[],
  role: HumanActionOwnerRole | "All",
): HumanActionQueueItem[] {
  if (role === "All") return items;
  return items.filter((row) => row.recommendedOwnerRole === role);
}
