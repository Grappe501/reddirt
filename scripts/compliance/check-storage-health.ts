import { checkComplianceStorageHealth } from "../../src/lib/compliance/storage/storage-health";

async function main() {
  const health = await checkComplianceStorageHealth();
  console.log(JSON.stringify(health, null, 2));
  if (!health.envPresent && process.env.CI === "true") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
