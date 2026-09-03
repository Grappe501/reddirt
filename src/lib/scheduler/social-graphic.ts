import { parseOptionalHref } from "@/lib/scheduler/public-card-fields";

const MAX_BYTES = 3_000_000;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SocialGraphicUploadError = "type" | "size" | "storage" | "empty";

function safeSlugSegment(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "event";
}

export async function uploadSchedulerSocialGraphic(
  slug: string,
  file: File,
): Promise<{ url: string } | { error: SocialGraphicUploadError }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: "type" };
  if (file.size < 32) return { error: "empty" };
  if (file.size > MAX_BYTES) return { error: "size" };

  try {
    const { uploadObject } = await import("@/lib/owned-media/ingest/supabase-storage");
    const path = `scheduler/event-graphics/${safeSlugSegment(slug)}/${Date.now()}.${ext}`;
    const data = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadObject({ path, data, contentType: file.type });
    return { url: uploaded.publicUrl };
  } catch {
    return { error: "storage" };
  }
}

export function parseSocialGraphicUrl(raw: string): string | null {
  return parseOptionalHref(raw);
}
