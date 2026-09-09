import assert from "node:assert/strict";
import { parseAndNormalizeHouseXml } from "../src/lib/parse-house-xml";

const xml = `
<rollcall-vote>
  <vote-metadata>
    <congress>119</congress>
    <action-date>14-Jul-2026</action-date>
    <vote-question>On Passage</vote-question>
    <legis-num>H R 139</legis-num>
  </vote-metadata>
  <vote-data>
    <recorded-vote><legislator party="R" state="AR" name-id="H001072">Hill</legislator><vote>Yea</vote></recorded-vote>
    <recorded-vote><legislator party="R" state="TX" name-id="R000001">Republican A</legislator><vote>Yea</vote></recorded-vote>
    <recorded-vote><legislator party="R" state="FL" name-id="R000002">Republican B</legislator><vote>Nay</vote></recorded-vote>
    <recorded-vote><legislator party="D" state="CA" name-id="D000001">Democrat A</legislator><vote>Nay</vote></recorded-vote>
    <recorded-vote><legislator party="D" state="NY" name-id="D000002">Democrat B</legislator><vote>Nay</vote></recorded-vote>
  </vote-data>
</rollcall-vote>`;

const record = parseAndNormalizeHouseXml({
  xml,
  year: 2026,
  rollCall: 238,
  sourceUrl: "https://clerk.house.gov/evs/2026/roll238.xml",
});

assert.ok(record);
assert.equal(record.hillVote, "Yea");
assert.equal(record.republicanYea, 2);
assert.equal(record.republicanNay, 1);
assert.equal(record.democratYea, 0);
assert.equal(record.democratNay, 2);
assert.equal(record.partyMajorityPosition, "Yea");
assert.equal(record.hillAlignedWithGop, true);
assert.equal(record.trumpPosition, "No documented position");
console.log("House XML parser test passed");
