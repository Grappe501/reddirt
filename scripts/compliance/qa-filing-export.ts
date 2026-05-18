import { createDraftFilingSnapshot, loadFilingSnapshots } from "../../src/lib/compliance/filings/filing-storage";

async function main() {
  const snapshot = await createDraftFilingSnapshot({ label: "Synthetic QA filing package", createdByInitials: "QA" });
  if (!snapshot.packageHash || snapshot.auditHashManifest.length === 0) throw new Error("Filing package hash manifest missing.");
  if (snapshot.humanCertificationRequired !== true) throw new Error("Filing package must require human certification.");
  const all = await loadFilingSnapshots();
  if (!all.some((filing) => filing.id === snapshot.id)) throw new Error("Filing package did not persist.");
  console.log(JSON.stringify({ status: "ok", filingId: snapshot.id, filingStatus: snapshot.status, packageHash: snapshot.packageHash.slice(0, 16) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
