-- CreateEnum
CREATE TYPE "ComplianceDocumentType" AS ENUM (
  'SOS_ETHICS_FORM',
  'FILING_INSTRUCTIONS',
  'PRIOR_SUBMITTED_REPORT',
  'RECEIPT',
  'REIMBURSEMENT',
  'BANK_OR_EXPORT_STATEMENT',
  'POLICY_MEMO',
  'COUNSEL_GUIDANCE',
  'DEADLINE_CALENDAR',
  'DISCLAIMER_OR_TEMPLATE',
  'OTHER'
);

-- CreateTable
CREATE TABLE "ComplianceDocument" (
  "id" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "originalFileName" TEXT,
  "mimeType" TEXT NOT NULL,
  "fileSizeBytes" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "documentType" "ComplianceDocumentType" NOT NULL DEFAULT 'OTHER',
  "reportingPeriod" TEXT,
  "periodDate" TIMESTAMP(3),
  "notes" TEXT,
  "approvedForAiReference" BOOLEAN NOT NULL DEFAULT false,
  "uploadedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceDocument_documentType_createdAt_idx" ON "ComplianceDocument"("documentType", "createdAt");
CREATE INDEX "ComplianceDocument_createdAt_idx" ON "ComplianceDocument"("createdAt");
CREATE INDEX "ComplianceDocument_approvedForAiReference_createdAt_idx" ON "ComplianceDocument"("approvedForAiReference", "createdAt");

-- AddForeignKey
ALTER TABLE "ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
