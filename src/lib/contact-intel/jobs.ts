import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { guessContactIntelMapping } from "@/lib/contact-intel/mapping";
import {
  ContactIntelUploadError,
  hashContactIntelBuffer,
  hashContactIntelRow,
  parseContactIntelUpload,
  sanitizeContactIntelFilename,
} from "@/lib/contact-intel/parse";

export async function createContactIntelImportJob(input: {
  filename: string;
  buffer: Buffer;
  sourceLabel?: string | null;
  createdByUserId?: string | null;
}) {
  const filename = sanitizeContactIntelFilename(input.filename);
  const parsed = parseContactIntelUpload(filename, input.buffer);
  if (parsed.headers.length === 0) {
    throw new ContactIntelUploadError("headers", "No header row found.");
  }
  if (parsed.rows.length === 0) {
    throw new ContactIntelUploadError("rows", "No data rows found.");
  }

  const fileHash = hashContactIntelBuffer(input.buffer);
  const mapping = guessContactIntelMapping(parsed.headers);

  return prisma.$transaction(async (tx) => {
    const job = await tx.contactIntelImportJob.create({
      data: {
        originalFilename: filename,
        fileHash,
        sourceLabel: input.sourceLabel?.trim() || null,
        createdByUserId: input.createdByUserId ?? null,
        mappingJson: mapping as unknown as Prisma.InputJsonValue,
        headerJson: parsed.headers as unknown as Prisma.InputJsonValue,
        statsJson: { uploadedRows: parsed.rows.length },
      },
    });

    const chunkSize = 400;
    for (let i = 0; i < parsed.rows.length; i += chunkSize) {
      const slice = parsed.rows.slice(i, i + chunkSize);
      await tx.contactIntelSourceRow.createMany({
        data: slice.map((raw, offset) => ({
          jobId: job.id,
          rowNumber: i + offset + 1,
          rawJson: raw as unknown as Prisma.InputJsonValue,
          rowHash: hashContactIntelRow(raw),
        })),
      });
    }

    return job.id;
  });
}
