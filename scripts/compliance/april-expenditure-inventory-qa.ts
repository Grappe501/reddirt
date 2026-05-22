import { assertAprilExpenditureInventoryPackage } from "../../src/lib/compliance/inventory/validate-april-expenditure-inventory";
import { writeAprilExpenditureInventoryArtifacts } from "../../src/lib/compliance/inventory/write-april-expenditure-inventory-artifacts";

async function main() {
  const out = await writeAprilExpenditureInventoryArtifacts();
  await assertAprilExpenditureInventoryPackage(out.jsonPath);
  console.log(
    JSON.stringify(
      {
        status: "ok",
        schemaValidated: true,
        totalsReconcile: true,
        summary: out.inventory.summary,
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
