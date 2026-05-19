import { writeAprilExpenditureInventoryArtifacts } from "../../src/lib/compliance/inventory/write-april-expenditure-inventory-artifacts";

async function main() {
  const out = await writeAprilExpenditureInventoryArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: out.inventory.commitBase,
        summary: out.inventory.summary,
        paths: { json: out.jsonPath, markdown: out.mdPath },
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
