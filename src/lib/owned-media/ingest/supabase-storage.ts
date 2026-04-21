import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase storage ingest.");
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export function getCampaignMediaBucketName(): string {
  return (process.env.SUPABASE_CAMPAIGN_MEDIA_BUCKET ?? "campaign-media").trim() || "campaign-media";
}

export type UploadResult = { path: string; publicUrl: string };

/**
 * Path shape: `media/{year}/{month}/{fileName}` (leading slash omitted — Supabase uses relative keys).
 */
export async function uploadObject(params: { path: string; data: Buffer; contentType: string }): Promise<UploadResult> {
  const supabase = getSupabaseServiceClient();
  const bucket = getCampaignMediaBucketName();
  const { error } = await supabase.storage.from(bucket).upload(params.path, params.data, {
    contentType: params.contentType,
    upsert: false,
  });
  if (error) {
    if (String(error).includes("already exists") || (error as { message?: string }).message?.includes("Duplicate")) {
      // Retry with path containing extra segment — handled by caller; rethrow
    }
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(params.path);
  return { path: params.path, publicUrl: data.publicUrl };
}

export function getPublicUrlForPath(objectPath: string): string {
  const supabase = getSupabaseServiceClient();
  const bucket = getCampaignMediaBucketName();
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}
