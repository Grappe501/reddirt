import { prisma } from "@/lib/db";

export type PageKey =
  | "what-we-believe"
  | "why-this-movement"
  | "resources"
  | "direct-democracy"
  | "priorities";

export const PAGE_KEYS: PageKey[] = [
  "what-we-believe",
  "why-this-movement",
  "resources",
  "direct-democracy",
  "priorities",
];

export function parsePageKey(raw: string): PageKey | null {
  return PAGE_KEYS.includes(raw as PageKey) ? (raw as PageKey) : null;
}

export async function getPageBlockPayload<T extends Record<string, unknown>>(
  pageKey: PageKey,
  blockKey: string,
): Promise<T | null> {
  try {
    const block = await prisma.adminContentBlock.findUnique({
      where: { pageKey_blockKey: { pageKey, blockKey } },
    });
    if (!block?.payload || typeof block.payload !== "object") return null;
    return block.payload as T;
  } catch {
    return null;
  }
}

export type HeroBlockPayload = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};
