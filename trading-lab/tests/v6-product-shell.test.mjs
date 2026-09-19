import test from "node:test";import assert from "node:assert/strict";import {routeFromLocation,v6ShellMarkup,dashboardFirstFrame,V6_ROUTES} from "../src/v6-product-shell.js";
test("V6-02 canonical navigation",()=>assert.deepEqual(V6_ROUTES.map(x=>x.id),["dashboard","portfolio","research","markets","lab","university","competition"]));
test("V6-02 route parser fails safely",()=>{assert.equal(routeFromLocation({hash:"#/research"}),"research");assert.equal(routeFromLocation({hash:"#/unknown"}),"dashboard")});
test("V6-02 dashboard is bounded",()=>{const h=dashboardFirstFrame({attention:["a","b","c","d"]});assert.equal((h.match(/<article>/g)||[]).length,4);assert.doesNotMatch(h,/canvas|<svg|agent grid/i);assert.match(h,/GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY/)});
test("V6-02 shell has Intelligence Tape and simulation boundary",()=>{const h=v6ShellMarkup({content:"x"});assert.match(h,/WB INTELLIGENCE/);assert.match(h,/SIMULATION ONLY/)});
console.log("V6-02 Product Shell + Experience Router: PASS");
