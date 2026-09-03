import { prisma } from "@/lib/db";

function slugify(title: string, ymd: string): string {
  const base = `${title}-${ymd}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || `stop-${ymd}`;
}

export async function uniqueEventSlug(title: string, ymd: string): Promise<string> {
  const base = slugify(title, ymd);
  const existing = await prisma.campaignEvent.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing) return base;
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}
