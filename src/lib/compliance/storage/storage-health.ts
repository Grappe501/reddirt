import { getComplianceBucketName, getSupabaseStorageClient } from "./document-storage";

export type ComplianceStorageHealth = {
  envPresent: boolean;
  bucketReachable: boolean;
  signedUrlCapable: boolean;
  localFallbackActive: boolean;
  rlsConfiguredManual: boolean;
  ready: boolean;
  summary: string;
};

export async function checkComplianceStorageHealth(): Promise<ComplianceStorageHealth> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const envPresent = Boolean(supabaseUrl && serviceKey);
  const client = getSupabaseStorageClient();
  const localFallbackActive = !client;
  let bucketReachable = false;
  let signedUrlCapable = false;
  if (client) {
    const bucket = getComplianceBucketName();
    const list = await client.storage.from(bucket).list("", { limit: 1 });
    bucketReachable = !list.error;
    if (bucketReachable) {
      const signed = await client.storage.from(bucket).createSignedUrl("health-check-probe.txt", 60);
      signedUrlCapable = !signed.error;
    }
  }
  const rlsConfiguredManual = process.env.COMPLIANCE_STORAGE_RLS_VERIFIED === "true";
  const ready = envPresent && bucketReachable && !localFallbackActive;
  const summary = localFallbackActive
    ? "Local private storage fallback active. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and private bucket."
    : ready
      ? "Supabase private bucket reachable. Confirm RLS policies manually in Supabase dashboard."
      : "Supabase env present but bucket probe failed.";
  return { envPresent, bucketReachable, signedUrlCapable, localFallbackActive, rlsConfiguredManual, ready, summary };
}
