import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ComplianceDocumentType =
  | "receipt"
  | "cash_slip_photo"
  | "bill_photo"
  | "check_image"
  | "w9"
  | "contract"
  | "invoice"
  | "filing_snapshot";

export type ComplianceDocumentMetadata = {
  id: string;
  documentType: ComplianceDocumentType;
  storageProvider: "local_private" | "supabase_private";
  bucket?: string;
  objectPath: string;
  originalFileName: string;
  contentType?: string;
  sha256: string;
  byteSize: number;
  uploadedAt: string;
  uploadedByInitials: string;
  relatedRecordId?: string;
  privateAccessOnly: true;
};

const LOCAL_DOCUMENT_DIR = path.join(process.cwd(), "data", "compliance", "documents");
const METADATA_PATH = path.join(LOCAL_DOCUMENT_DIR, "document-metadata.json");

export async function uploadComplianceDocument(input: {
  documentType: ComplianceDocumentType;
  fileName: string;
  bytes: Buffer;
  contentType?: string;
  uploadedByInitials: string;
  relatedRecordId?: string;
}): Promise<ComplianceDocumentMetadata> {
  const sha256 = createHash("sha256").update(input.bytes).digest("hex");
  const now = new Date().toISOString();
  const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "document";
  const objectPath = `${input.documentType}/${now.slice(0, 10)}/${sha256.slice(0, 16)}-${safeName}`;
  const supabase = getSupabaseStorageClient();
  const bucket = getComplianceBucketName();
  const metadata: ComplianceDocumentMetadata = {
    id: `doc-${Date.now()}-${sha256.slice(0, 8)}`,
    documentType: input.documentType,
    storageProvider: supabase ? "supabase_private" : "local_private",
    bucket: supabase ? bucket : undefined,
    objectPath,
    originalFileName: input.fileName,
    contentType: input.contentType,
    sha256,
    byteSize: input.bytes.byteLength,
    uploadedAt: now,
    uploadedByInitials: input.uploadedByInitials.trim().toUpperCase() || "UNK",
    relatedRecordId: input.relatedRecordId,
    privateAccessOnly: true,
  };
  if (supabase) {
    const { error } = await supabase.storage.from(bucket).upload(objectPath, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });
    if (error) throw error;
  } else {
    const absolutePath = path.join(LOCAL_DOCUMENT_DIR, objectPath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.bytes);
  }
  await saveDocumentMetadata([metadata, ...(await loadDocumentMetadata())]);
  return metadata;
}

export async function createComplianceDocumentSignedUrl(input: {
  objectPath: string;
  expiresInSeconds?: number;
}): Promise<{ url?: string; warning?: string }> {
  const supabase = getSupabaseStorageClient();
  if (!supabase) {
    return { warning: "Local private storage does not expose signed URLs. Use server-side download only." };
  }
  const { data, error } = await supabase.storage
    .from(getComplianceBucketName())
    .createSignedUrl(input.objectPath, input.expiresInSeconds ?? 300);
  if (error) return { warning: error.message };
  return { url: data.signedUrl };
}

export async function loadDocumentMetadata(): Promise<ComplianceDocumentMetadata[]> {
  return readJson<ComplianceDocumentMetadata[]>(METADATA_PATH, []);
}

async function saveDocumentMetadata(metadata: ComplianceDocumentMetadata[]): Promise<void> {
  await mkdir(path.dirname(METADATA_PATH), { recursive: true });
  await writeFile(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

function getSupabaseStorageClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getComplianceBucketName(): string {
  return process.env.SUPABASE_COMPLIANCE_BUCKET?.trim() || "compliance-private";
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}
