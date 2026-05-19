import { checkComplianceStorageHealth } from "../../src/lib/compliance/storage/storage-health";

async function main() {
  const health = await checkComplianceStorageHealth();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        mode: health.localFallbackActive ? "local_private" : "supabase",
        envPresent: health.envPresent,
        bucketReachable: health.bucketReachable,
        rlsConfiguredManual: health.rlsConfiguredManual,
        ready: health.ready,
        summary: health.summary,
        productionChecklist: "docs/compliance/COMPLIANCE_SUPABASE_STORAGE_PRODUCTION_CHECKLIST.md",
        evidenceNeverPublicByDefault: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
