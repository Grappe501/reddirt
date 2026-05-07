-- REDDIRT-MIGRATION-DEPENDENCY-REPAIR-1.0 — add EmailContactProfile → RelationalContact FK after REL-2 creates the table.

ALTER TABLE "EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
