import { getComplianceBucketName, getSupabaseStorageClient } from "./document-storage";

export async function createComplianceSignedUrl(objectPath: string, expiresInSeconds = 300): Promise<{ url?: string; error?: string; localFallback?: boolean }> {
  const client = getSupabaseStorageClient();
  if (!client) {
    return { error: "Supabase not configured — use local private storage path only.", localFallback: true };
  }
  const bucket = getComplianceBucketName();
  const result = await client.storage.from(bucket).createSignedUrl(objectPath, expiresInSeconds);
  if (result.error) return { error: result.error.message };
  return { url: result.data.signedUrl };
}
