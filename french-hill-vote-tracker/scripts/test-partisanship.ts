import assert from "node:assert/strict";
import { scorePartisanship, isHillAlignedWithParty } from "../src/lib/partisanship";

const highlyPartisan = scorePartisanship({
  republicanYea: 205,
  republicanNay: 10,
  democratYea: 8,
  democratNay: 204,
});
assert.equal(highlyPartisan.republicanMajorityPosition, "Yea");
assert.equal(highlyPartisan.democratMajorityPosition, "Nay");
assert.equal(highlyPartisan.highPartisanship, true);
assert.equal(isHillAlignedWithParty("Yea", highlyPartisan.republicanMajorityPosition), true);
assert.equal(isHillAlignedWithParty("Nay", highlyPartisan.republicanMajorityPosition), false);

const bipartisan = scorePartisanship({
  republicanYea: 180,
  republicanNay: 35,
  democratYea: 170,
  democratNay: 42,
});
assert.equal(bipartisan.partiesOpposed, false);
assert.equal(bipartisan.highPartisanship, false);
assert.equal(bipartisan.partisanshipScore, null);

const nearThreshold = scorePartisanship({
  republicanYea: 90,
  republicanNay: 10,
  democratYea: 10,
  democratNay: 90,
});
assert.equal(nearThreshold.highPartisanship, true);
assert.equal(nearThreshold.partisanshipScore, 90);

console.log("partisanship tests passed");
