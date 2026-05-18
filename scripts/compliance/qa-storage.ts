import { createComplianceDocumentSignedUrl, loadDocumentMetadata, uploadComplianceDocument } from "../../src/lib/compliance/storage/document-storage";

async function main() {
  const metadata = await uploadComplianceDocument({
    documentType: "filing_snapshot",
    fileName: "synthetic-filing-snapshot.txt",
    bytes: Buffer.from("synthetic compliance storage QA"),
    contentType: "text/plain",
    uploadedByInitials: "QA",
    relatedRecordId: "qa-storage",
  });
  if (!metadata.sha256 || metadata.privateAccessOnly !== true) throw new Error("Document metadata missing privacy/hash fields.");
  const signed = await createComplianceDocumentSignedUrl({ objectPath: metadata.objectPath });
  const all = await loadDocumentMetadata();
  if (!all.some((item) => item.id === metadata.id)) throw new Error("Document metadata did not persist.");
  console.log(JSON.stringify({ status: "ok", provider: metadata.storageProvider, documentId: metadata.id, signedUrlAvailable: Boolean(signed.url), warning: signed.warning }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
