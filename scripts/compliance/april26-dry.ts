import { buildApril26ImportStatus } from "../../src/lib/compliance/imports/april26-import-status";

async function main() {
  const status = await buildApril26ImportStatus();
  console.log(JSON.stringify({ status: "ok", dryRun: true, april26: status }, null, 2));
  if (!status.folderExists) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
