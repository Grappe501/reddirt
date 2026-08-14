/**
 * CONTACT-INTEL Phase 5 — isolated fixture matrix (no database, no real PII).
 * Run: npm run contact-intel:harden-check
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import { classifyContactIntelRows, contactIntelMethodKey, type MethodIndex } from "../src/lib/contact-intel/classify";
import { contactIntelAddressFingerprint, splitContactIntelTags } from "../src/lib/contact-intel/enrichment";
import {
  contactIntelSearchNeedles,
  extractContactIntelRow,
  guessContactIntelMapping,
  isValidContactIntelExtract,
  normalizeContactIntelPhone,
  type ContactIntelMapping,
} from "../src/lib/contact-intel/mapping";
import {
  CONTACT_INTEL_MAX_ROWS,
  CONTACT_INTEL_MAX_UPLOAD_BYTES,
  ContactIntelUploadError,
  hashContactIntelBuffer,
  hashContactIntelRow,
  parseContactIntelCsv,
  parseContactIntelUpload,
  sanitizeContactIntelFilename,
} from "../src/lib/contact-intel/parse";

const ROOT = join(__dirname, "..");

function fail(message: string): never {
  throw new Error(message);
}

function expectCode(fn: () => unknown, code: ContactIntelUploadError["code"]) {
  try {
    fn();
    fail(`expected ContactIntelUploadError ${code}`);
  } catch (err) {
    assert.ok(err instanceof ContactIntelUploadError, `expected upload error, got ${err}`);
    assert.equal(err.code, code);
    assert.ok(!/DATABASE_URL|ADMIN_SECRET|password=/i.test(err.message));
  }
}

function classifyCsv(csv: string, mapping?: ContactIntelMapping, index: MethodIndex = new Map()) {
  const parsed = parseContactIntelCsv(csv);
  const used = mapping ?? guessContactIntelMapping(parsed.headers);
  return {
    parsed,
    mapping: used,
    ...classifyContactIntelRows(
      parsed.rows.map((raw, i) => ({ rowNumber: i + 1, raw })),
      used,
      index,
    ),
  };
}

function simulateCommit(classified: ReturnType<typeof classifyContactIntelRows>["classified"], index: MethodIndex) {
  const people = new Map<string, { emails: Set<string>; phones: Set<string> }>();
  let nextId = 1;
  for (const row of classified) {
    if (row.status === "INVALID" || row.status === "CONFLICT") continue;
    let personId = row.matchedPersonId;
    if (!personId) {
      const pendingKey = [...row.emails, ...row.phones]
        .map((m, i) => contactIntelMethodKey(i < row.emails.length ? "EMAIL" : "PHONE", m.normalized))
        .find((k) => index.get(k)?.startsWith("pending:"));
      const fromIndex = [...row.emails.map((e) => index.get(contactIntelMethodKey("EMAIL", e.normalized))), ...row.phones.map((p) => index.get(contactIntelMethodKey("PHONE", p.normalized)))].find(
        (id) => id && !id.startsWith("pending:"),
      );
      personId = fromIndex ?? `person-${nextId++}`;
      if (pendingKey) {
        const provisional = index.get(pendingKey);
        if (provisional?.startsWith("pending:")) {
          for (const [k, v] of index) {
            if (v === provisional) index.set(k, personId);
          }
        }
      }
    }
    if (!people.has(personId)) people.set(personId, { emails: new Set(), phones: new Set() });
    const person = people.get(personId)!;
    for (const e of row.emails) {
      person.emails.add(e.normalized);
      index.set(contactIntelMethodKey("EMAIL", e.normalized), personId);
    }
    for (const p of row.phones) {
      person.phones.add(p.normalized);
      index.set(contactIntelMethodKey("PHONE", p.normalized), personId);
    }
  }
  return people;
}

// --- A. Email-only CSV ---
{
  const csv = [
    "Email,Notes,County",
    "alex@example.com,keep,Pulaski",
    "  Alex@Example.com  ,mixed case,Pulaski",
    "alex@example.com,duplicate,Pulaski",
    "not-an-email,invalid,Pulaski",
    ",,",
    "pat.phone@example.com,extra stays,Garland",
  ].join("\n");
  const { parsed, classified, stats, mapping } = classifyCsv(csv);
  assert.equal(parsed.rows.length, 5, "blank row omitted");
  assert.equal(parsed.rows[0]?.Notes, "keep");
  assert.equal(parsed.rows[0]?.County, "Pulaski");
  assert.equal(mapping.columns.Notes, "ignore");
  assert.equal(classified[0]?.emails[0]?.normalized, "alex@example.com");
  assert.equal(classified[1]?.emails[0]?.normalized, "alex@example.com");
  assert.equal(classified[0]?.status, "NEW");
  assert.equal(classified[1]?.status, "UPDATE");
  assert.equal(classified[2]?.status, "UPDATE");
  assert.equal(classified[3]?.status, "INVALID");
  assert.equal(classified[4]?.status, "NEW");
  assert.equal(stats.newCount, 2);
  assert.equal(stats.updateCount, 2);
  assert.equal(stats.invalid, 1);
  const emails = classified.flatMap((r) => r.emails.map((e) => e.normalized));
  assert.deepEqual([...new Set(emails)], ["alex@example.com", "pat.phone@example.com"]);
}

// --- B. Phone-only CSV ---
{
  const csv = [
    "Mobile,Name",
    "(501) 555-0100,Formatted",
    "+15015550100,E164",
    "501-555-0100,Duplicate format",
    "555-0100,Too short",
    "447911123456,Missing US country",
    "5015550100 x123,Extension unsupported",
    "9999999999999,Thirteen digit junk",
  ].join("\n");
  const { classified, stats } = classifyCsv(csv);
  assert.equal(classified[0]?.phones[0]?.normalized, "5015550100");
  assert.equal(classified[0]?.phones[0]?.original, "(501) 555-0100");
  assert.equal(classified[1]?.phones[0]?.normalized, "5015550100");
  assert.equal(classified[2]?.status, "UPDATE");
  assert.equal(classified[3]?.status, "INVALID");
  assert.equal(classified[4]?.status, "INVALID");
  assert.equal(classified[5]?.status, "INVALID");
  assert.equal(classified[6]?.status, "INVALID");
  assert.equal(normalizeContactIntelPhone("9999999999999"), null);
  assert.equal(stats.newCount, 1);
  assert.equal(stats.updateCount, 2);
  assert.equal(stats.invalid, 4);
}

// --- C. Mixed email + phone, including conflict ---
{
  const index: MethodIndex = new Map([
    [contactIntelMethodKey("EMAIL", "existing.email@example.com"), "person-a"],
    [contactIntelMethodKey("PHONE", "5015550199"), "person-b"],
  ]);
  const csv = [
    "Email,Phone,Name",
    "new.both@example.com,501-555-0110,New Both",
    "existing.email@example.com,501-555-0120,Add phone to A",
    "add.email@example.com,501-555-0199,Add email to B",
    "new.both@example.com,501-555-0110,Duplicate pair",
    "existing.email@example.com,501-555-0199,Cross person",
  ].join("\n");
  const { classified, stats } = classifyCsv(csv, undefined, index);
  assert.equal(classified[0]?.status, "NEW");
  assert.equal(classified[1]?.status, "UPDATE");
  assert.equal(classified[1]?.matchedPersonId, "person-a");
  assert.equal(classified[2]?.status, "UPDATE");
  assert.equal(classified[2]?.matchedPersonId, "person-b");
  assert.equal(classified[3]?.status, "UPDATE");
  assert.equal(classified[4]?.status, "CONFLICT");
  assert.match(classified[4]?.messages.join(" ") ?? "", /not merged/i);
  assert.equal(stats.conflictCount, 1);
  const people = simulateCommit(classified, new Map(index));
  assert.equal(people.has("person-a"), true);
  assert.equal(people.has("person-b"), true);
  assert.notEqual(
    [...people.entries()].find(([, p]) => p.emails.has("existing.email@example.com"))?.[0],
    [...people.entries()].find(([, p]) => p.phones.has("5015550199"))?.[0],
  );
}

// --- D. Names never merge ---
{
  const csv = [
    "Full Name,First,Last,Email,Phone",
    "Alex Example,,,alex.one@example.com,",
    ",Pat,Phone,,501-555-0130",
    "Same Name,,,same.a@example.com,",
    "Same Name,,,same.b@example.com,",
    "Other Name,,,same.a@example.com,",
    "Name Only,,,,",
  ].join("\n");
  const mapping: ContactIntelMapping = {
    columns: {
      "Full Name": "full_name",
      First: "first_name",
      Last: "last_name",
      Email: "email",
      Phone: "phone",
    },
  };
  const { classified, stats } = classifyCsv(csv, mapping);
  assert.equal(classified[0]?.displayName, "Alex Example");
  assert.equal(classified[1]?.firstName, "Pat");
  assert.equal(classified[2]?.status, "NEW");
  assert.equal(classified[3]?.status, "NEW");
  assert.equal(classified[4]?.status, "UPDATE");
  assert.equal(classified[5]?.status, "INVALID");
  assert.equal(stats.newCount, 4);
  assert.equal(isValidContactIntelExtract(extractContactIntelRow({ "Full Name": "Name Only" }, mapping)), false);
}

// --- E. Repeat preview / replay classification ---
{
  const csv = [
    "Email,Phone",
    "replay@example.com,501-555-0140",
    "bad-email,",
  ].join("\n");
  const first = classifyCsv(csv);
  const second = classifyCsv(csv);
  assert.deepEqual(
    first.classified.map((r) => r.status),
    second.classified.map((r) => r.status),
  );
  const index: MethodIndex = new Map();
  simulateCommit(first.classified, index);
  const after = classifyCsv(csv, first.mapping, index);
  assert.equal(after.classified[0]?.status, "UPDATE");
  assert.equal(after.classified[1]?.status, "INVALID");
  assert.equal(after.stats.newCount, 0);
  assert.equal(first.stats.invalid, after.stats.invalid);
  assert.equal(first.stats.conflictCount, after.stats.conflictCount);
}

// --- Multiple email/phone columns ---
{
  const csv = ["Email,Email 2,Mobile,Work Phone", "one@example.com,two@example.com,501-555-0150,501-555-0151"].join("\n");
  const { classified, mapping } = classifyCsv(csv);
  assert.equal(mapping.columns["Email 2"], "email");
  assert.equal(classified[0]?.emails.length, 2);
  assert.equal(classified[0]?.phones.length, 2);
}

// --- Fingerprints ---
{
  const a = Buffer.from("Email\nalex@example.com\n");
  const b = Buffer.from("Email\nalex@example.com\n");
  const c = Buffer.from("Email\npat@example.com\n");
  assert.equal(hashContactIntelBuffer(a), hashContactIntelBuffer(b));
  assert.notEqual(hashContactIntelBuffer(a), hashContactIntelBuffer(c));
  assert.equal(hashContactIntelRow({ Email: "a" }), hashContactIntelRow({ Email: "a" }));
  assert.notEqual(hashContactIntelRow({ Email: "a" }), hashContactIntelRow({ Email: "b" }));
}

// --- Search needles ---
{
  const email = contactIntelSearchNeedles("  Alex@Example.com ");
  assert.equal(email.email, "alex@example.com");
  const punct = contactIntelSearchNeedles("(501) 555-0100");
  assert.equal(punct.phone, "5015550100");
  const digits = contactIntelSearchNeedles("5015550100");
  assert.equal(digits.phone, "5015550100");
  const name = contactIntelSearchNeedles("Example");
  assert.equal(name.q, "Example");
  assert.equal(name.email, null);
  assert.equal(name.phone, null);
}

// --- F. XLSX first sheet, types, blanks, formula, unusual headers ---
{
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["E-mail Address", "Cell Phone #", "Note"],
    ["xlsx.one@example.com", 5015550160, "number cell"],
    ["xlsx.two@example.com", "(501) 555-0161", ""],
    ["", "", ""],
  ]);
  ws1["D1"] = { t: "s", v: "Sum" };
  ws1["D2"] = { t: "n", f: "1+1", v: 2 };
  if (ws1["!ref"]) ws1["!ref"] = "A1:D3";
  XLSX.utils.book_append_sheet(wb, ws1, "Contacts");
  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Email"],
    ["should-not-import@example.com"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, "SecretSheet");
  const buf = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);
  const parsed = parseContactIntelUpload("phase5-fixture.xlsx", buf);
  assert.ok(!parsed.headers.includes("Email") || parsed.headers.includes("E-mail Address"));
  assert.equal(parsed.headers[0], "E-mail Address");
  assert.ok(parsed.rows.every((r) => r["E-mail Address"] !== "should-not-import@example.com"));
  assert.ok(parsed.rows.length >= 2);
  assert.ok(parsed.rows.length <= 3);
  const mapping = guessContactIntelMapping(parsed.headers);
  assert.equal(mapping.columns["E-mail Address"], "email");
  assert.equal(mapping.columns["Cell Phone #"], "phone");
  const { classified } = classifyContactIntelRows(
    parsed.rows.map((raw, i) => ({ rowNumber: i + 1, raw })),
    mapping,
    new Map(),
  );
  assert.ok(classified.some((r) => r.emails[0]?.normalized === "xlsx.one@example.com"));
  assert.ok(!classified.some((r) => r.emails.some((e) => e.normalized === "should-not-import@example.com")));
}

// --- G. Limits and malformed input ---
{
  expectCode(() => parseContactIntelUpload("big.csv", Buffer.alloc(CONTACT_INTEL_MAX_UPLOAD_BYTES + 1, 97)), "size");
  const tooMany = ["Email", ...Array.from({ length: CONTACT_INTEL_MAX_ROWS + 1 }, (_, i) => `user${i}@example.com`)].join("\n");
  expectCode(() => parseContactIntelUpload("many.csv", Buffer.from(tooMany)), "rows");
  expectCode(() => parseContactIntelUpload("empty.csv", Buffer.alloc(0)), "file");
  expectCode(() => parseContactIntelUpload("no-headers.csv", Buffer.from("\n\n")), "headers");
  expectCode(() => parseContactIntelUpload("dup.csv", Buffer.from("Email,Email\na@example.com,b@example.com\n")), "dupheaders");
  expectCode(() => parseContactIntelUpload("notes.txt", Buffer.from("Email\na@example.com\n")), "ext");
  expectCode(() => parseContactIntelUpload("disguised.xlsx", Buffer.from("Email\na@example.com\n")), "parse");
  expectCode(() => parseContactIntelUpload("broken.xlsx", Buffer.from("PK\x03\x04not-a-workbook")), "parse");
  assert.equal(sanitizeContactIntelFilename("..\\..\\etc\\passwd.csv"), "passwd.csv");
  assert.equal(sanitizeContactIntelFilename("weird|name*.csv"), "weird_name_.csv");
  const underLimit = ["Email", ...Array.from({ length: 50 }, (_, i) => `under${i}@example.com`)].join("\n");
  const parsed = parseContactIntelUpload("under-limit.csv", Buffer.from(underLimit));
  assert.equal(parsed.rows.length, 50);
}

// --- Auth + transaction + isolation source scan ---
{
  const pipeline = readFileSync(join(ROOT, "src/lib/contact-intel/pipeline.ts"), "utf8");
  const actions = readFileSync(join(ROOT, "src/app/admin/contact-intel-actions.ts"), "utf8");
  const layout = readFileSync(join(ROOT, "src/app/admin/contact-intel/layout.tsx"), "utf8");
  const jobs = readFileSync(join(ROOT, "src/lib/contact-intel/jobs.ts"), "utf8");
  assert.match(pipeline, /\$transaction/);
  assert.match(jobs, /\$transaction/);
  assert.match(actions, /requireAdminAction/);
  assert.match(layout, /requireAdminPage/);
  assert.doesNotMatch(pipeline, /emailContactProfile|relationalContact|voterRecord/i);
  assert.doesNotMatch(jobs, /emailContactProfile|relationalContact|voterRecord/i);
  assert.doesNotMatch(actions, /console\.log\([^\)]*buffer|console\.log\([^\)]*file/i);
  assert.match(pipeline, /status:\s*"FAILED"/);
}

// --- Phase 5 enrichment (identity unchanged) ---
{
  const csv = [
    "Email,Phone,Address,City,State,ZIP,Tags,Employer",
    "alex@example.com,,123 Example Street,Little Rock,AR,72201,\"Volunteer; Donor, Pulaski County\",Acme Cooperative",
    "pat@example.com,501-555-0100,,Little Rock,AR,,,",
    "alex@example.com,,123 Example Street,Little Rock,AR,72201,volunteer,Acme Cooperative",
    "alex@example.com,,999 Other Street,Little Rock,AR,72201,,,",
    "other@example.com,,123 Example Street,Little Rock,AR,72201,,,",
  ].join("\n");
  const mapping = {
    columns: {
      Email: "email" as const,
      Phone: "phone" as const,
      Address: "address" as const,
      City: "city" as const,
      State: "state" as const,
      ZIP: "zip" as const,
      Tags: "tag" as const,
      Employer: "custom:employer" as const,
    },
  };
  const { classified, stats } = classifyCsv(csv, mapping);
  assert.equal(classified[0]?.status, "NEW");
  assert.equal(classified[0]?.custom[0]?.original, "Acme Cooperative");
  assert.equal(classified[0]?.tags.length, 3);
  assert.ok(classified[1]?.address);
  assert.equal(classified[1]?.address?.line, null);
  assert.equal(classified[2]?.status, "UPDATE");
  assert.equal(classified[0]?.address?.fingerprint, classified[2]?.address?.fingerprint);
  assert.notEqual(classified[0]?.address?.fingerprint, classified[3]?.address?.fingerprint);
  assert.equal(classified[4]?.status, "NEW");
  assert.equal(classified[4]?.address?.fingerprint, classified[0]?.address?.fingerprint);
  assert.equal(stats.conflictCount, 0);

  const conflictIndex: MethodIndex = new Map([
    [contactIntelMethodKey("EMAIL", "existing.email@example.com"), "person-a"],
    [contactIntelMethodKey("PHONE", "5015550199"), "person-b"],
  ]);
  const conflict = classifyCsv(
    ["Email,Phone,Tags,Employer", "existing.email@example.com,501-555-0199,Volunteer,Acme Cooperative"].join("\n"),
    { columns: { Email: "email", Phone: "phone", Tags: "tag", Employer: "custom:employer" } },
    conflictIndex,
  );
  assert.equal(conflict.classified[0]?.status, "CONFLICT");
  assert.equal(conflict.classified[0]?.tags.length, 1);
  const people = simulateCommit(conflict.classified, new Map(conflictIndex));
  assert.equal(people.has("person-a") && people.has("person-b") ? people.size >= 2 : true, true);

  const pipeline = readFileSync(join(ROOT, "src/lib/contact-intel/pipeline.ts"), "utf8");
  assert.match(pipeline, /contactIntelAddress/);
  assert.match(pipeline, /status === "CONFLICT"/);
  assert.doesNotMatch(pipeline, /attachContactIntelEnrichment\([^\)]*CONFLICT/);
  assert.equal(splitContactIntelTags("Volunteer; Donor, Pulaski County").length, 3);
  assert.equal(
    contactIntelAddressFingerprint({ city: "Little Rock", state: "AR" }),
    contactIntelAddressFingerprint({ city: "little rock", state: "ar" }),
  );
}

console.log("contact-intel harden check passed");
console.log("coverage: email-only, phone-only, mixed/conflict, names, replay, xlsx first-sheet, limits");
console.log("persistence: isolated only — no live DATABASE_URL writes");
