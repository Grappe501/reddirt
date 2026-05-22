import { stat } from "node:fs/promises";
import path from "node:path";
import { sha256File } from "./extract-image";
import type { April26SourceDocumentRecord, April26SourceDocumentType } from "./types";

export class April26SourceDocumentRegistry {
  private documents = new Map<string, April26SourceDocumentRecord>();

  async register(input: {
    relativePath: string;
    absolutePath: string;
    sourceType: April26SourceDocumentType;
    extractionStatus: April26SourceDocumentRecord["extractionStatus"];
    humanReviewRequired: boolean;
    ocrConfidence?: April26SourceDocumentRecord["ocrConfidence"];
    linkedRecordIds?: string[];
  }): Promise<April26SourceDocumentRecord> {
    const sha256 = await sha256File(input.absolutePath);
    const fileStat = await stat(input.absolutePath);
    const id = `april26-doc-${sha256.slice(0, 16)}`;
    const record: April26SourceDocumentRecord = {
      id,
      relativePath: input.relativePath.replace(/\\/g, "/"),
      absolutePath: input.absolutePath,
      sourceType: input.sourceType,
      sha256,
      extractionStatus: input.extractionStatus,
      storageMode: "external_folder",
      humanReviewRequired: input.humanReviewRequired,
      ocrConfidence: input.ocrConfidence,
      linkedRecordIds: input.linkedRecordIds ?? [],
      fileSizeBytes: fileStat.size,
      updatedAt: new Date().toISOString(),
    };
    this.documents.set(id, record);
    return record;
  }

  linkRecord(documentId: string, recordId: string): void {
    const doc = this.documents.get(documentId);
    if (!doc) return;
    if (!doc.linkedRecordIds.includes(recordId)) doc.linkedRecordIds.push(recordId);
  }

  list(): April26SourceDocumentRecord[] {
    return [...this.documents.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }

  getByRelativePath(relativePath: string): April26SourceDocumentRecord | undefined {
    const normalized = relativePath.replace(/\\/g, "/");
    return this.list().find((doc) => doc.relativePath === normalized);
  }

  summary() {
    const docs = this.list();
    return {
      total: docs.length,
      byType: docs.reduce<Record<string, number>>((acc, doc) => {
        acc[doc.sourceType] = (acc[doc.sourceType] ?? 0) + 1;
        return acc;
      }, {}),
      pendingExtraction: docs.filter((doc) => doc.extractionStatus === "pending").length,
      humanReviewRequired: docs.filter((doc) => doc.humanReviewRequired).length,
    };
  }
}

export function registryPathLabel(relativePath: string): string {
  return path.basename(relativePath);
}
