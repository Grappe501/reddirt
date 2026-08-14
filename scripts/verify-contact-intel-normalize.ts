/**
 * CONTACT-INTEL-1.0 — pure mapping/normalize checks (no DB, no PII).
 * Run: node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/verify-contact-intel-normalize.ts
 */
import assert from "node:assert/strict";
import { contactIntelAddressFingerprint, splitContactIntelTags, normalizeCustomFieldKey } from "../src/lib/contact-intel/enrichment";
import { extractContactIntelRow, guessContactIntelMapping, isValidContactIntelExtract } from "../src/lib/contact-intel/mapping";
import { parseContactIntelCsv } from "../src/lib/contact-intel/parse";

const csv = [
  "Email Address,Mobile,Full Name,Notes",
  "Alex@Example.com,501-555-0100,Alex Example,keep me",
  ",(501) 555-0199,Pat PhoneOnly,phone only",
  "not-an-email,,No Identifier,drop",
].join("\n");

const parsed = parseContactIntelCsv(csv);
assert.equal(parsed.headers[0], "Email Address");
assert.equal(parsed.rows.length, 3);

const mapping = guessContactIntelMapping(parsed.headers);
assert.equal(mapping.columns["Email Address"], "email");
assert.equal(mapping.columns.Mobile, "phone");
assert.equal(mapping.columns["Full Name"], "full_name");
assert.equal(mapping.columns.Notes, "ignore");

const row0 = extractContactIntelRow(parsed.rows[0]!, mapping);
assert.equal(row0.emails[0]?.normalized, "alex@example.com");
assert.equal(row0.phones[0]?.normalized, "5015550100");
assert.equal(isValidContactIntelExtract(row0), true);

const row1 = extractContactIntelRow(parsed.rows[1]!, mapping);
assert.equal(row1.emails.length, 0);
assert.equal(row1.phones[0]?.normalized, "5015550199");
assert.equal(isValidContactIntelExtract(row1), true);

const row2 = extractContactIntelRow(parsed.rows[2]!, mapping);
assert.equal(isValidContactIntelExtract(row2), false);

const tags = splitContactIntelTags("Volunteer; Donor, Pulaski County");
assert.deepEqual(tags.map((t) => t.name), ["Volunteer", "Donor", "Pulaski County"]);
assert.equal(normalizeCustomFieldKey("Employer"), "employer");
assert.equal(
  contactIntelAddressFingerprint({ line: "123 Example Street", city: "Little Rock", state: "AR", postalCode: "72201" }),
  contactIntelAddressFingerprint({ line: "123  Example Street", city: "little rock", state: "ar", postalCode: "72201" }),
);

const enrichCsv = [
  "Email,Address,City,State,ZIP,Tags,Employer,Notes",
  "alex@example.com,123 Example Street,Little Rock,AR,72201,\"Volunteer; Donor, Pulaski County\",Acme Cooperative,keep extra",
].join("\n");
const enrichParsed = parseContactIntelCsv(enrichCsv);
const enrichMapping = {
  columns: {
    Email: "email" as const,
    Address: "address" as const,
    City: "city" as const,
    State: "state" as const,
    ZIP: "zip" as const,
    Tags: "tag" as const,
    Employer: "custom:employer" as const,
    Notes: "ignore" as const,
  },
};
const enrichRow = extractContactIntelRow(enrichParsed.rows[0]!, enrichMapping);
assert.equal(enrichRow.address?.city, "Little Rock");
assert.equal(enrichRow.address?.state, "AR");
assert.equal(enrichRow.tags.length, 3);
assert.equal(enrichRow.custom[0]?.key, "employer");
assert.equal(enrichRow.custom[0]?.original, "Acme Cooperative");
assert.equal(enrichParsed.rows[0]?.Notes, "keep extra");
assert.equal(isValidContactIntelExtract(enrichRow), true);

console.log("contact-intel normalize check passed");
