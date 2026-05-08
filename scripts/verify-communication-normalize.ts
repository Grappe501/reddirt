import assert from "assert";
import { normalizeEmail, parseEmailAddressList } from "../src/lib/communications/email-address";
import { normalizePhone } from "../src/lib/communications/phone";

assert.strictEqual(normalizeEmail("  Test@EXAMPLE.com "), "test@example.com");
assert.strictEqual(normalizeEmail("bad"), "");
const parsed = parseEmailAddressList(`Jane <jane@x.org>, bob@y.net`);
assert.strictEqual(parsed.length, 2);
assert.strictEqual(parsed[0]?.address, "jane@x.org");
assert.strictEqual(normalizePhone("+1 (501) 555-0199"), "5015550199");
console.log("verify-communication-normalize: OK");
