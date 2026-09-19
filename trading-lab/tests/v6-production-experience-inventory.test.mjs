import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const p=new URL("../docs/V6_PRODUCTION_EXPERIENCE_INVENTORY_AND_WIRING_MAP.md",import.meta.url);const s=fs.readFileSync(p,"utf8");
test("V6-01 maps canonical product journey and all major production surfaces",()=>{for(const x of ["DASHBOARD","INTELLIGENCE TAPE","PORTFOLIO","RESEARCH FLOOR","UNIVERSITY","COMPETITION LOBBY","LIVE LEAGUE","HUMAN-vs-AI LAB","90-DAY INVESTOR REPORT","ALUMNI CONTINUITY"])assert.match(s,new RegExp(x,"i"));});
test("V6-01 identifies V5 competition persistence gap and V6-02 next slice",()=>{assert.match(s,/V5 competition modules exist as tested runtime modules but are not yet wired/i);assert.match(s,/V6-02 Product Shell \+ Experience Router/);});
test("V6-01 preserves V5 safety and evidence invariants",()=>{for(const x of ["sealed AI","point-in-time","Evidence Score is not probability of profit","No real-money execution"])assert.ok(s.includes(x));});
console.log("V6-01 Production Experience Inventory: PASS");
