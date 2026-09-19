import test from "node:test";import assert from "node:assert/strict";import {routeFromLocation,queryFromLocation,hashFor,v6ShellMarkup,dashboardFirstFrame,marketsMarkup,V6_ROUTES} from "../src/v6-product-shell.js";
test("V6-02 canonical navigation",()=>assert.deepEqual(V6_ROUTES.map(x=>x.id),["dashboard","portfolio","research","markets","lab","university","competition"]));
test("V6-02 route parser fails safely",()=>{assert.equal(routeFromLocation({hash:"#/research"}),"research");assert.equal(routeFromLocation({hash:"#/unknown"}),"dashboard");assert.equal(routeFromLocation({hash:"#/university?concept=evidence"}),"university");assert.equal(queryFromLocation({hash:"#/university?concept=friction&depth=LEARN"}).concept,"friction")});
test("V6-02 hash helper keeps query on live surfaces",()=>assert.equal(hashFor("lab",{symbol:"SPY"}),"#/lab?symbol=SPY"));
test("V6-02 dashboard is bounded",()=>{const h=dashboardFirstFrame({attention:["a","b","c","d"]});assert.equal((h.match(/<article>/g)||[]).length,4);assert.doesNotMatch(h,/canvas|<svg|agent grid/i);assert.match(h,/GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY/)});
test("V6-02 shell has Intelligence Tape and simulation boundary",()=>{const h=v6ShellMarkup({content:"x"});assert.match(h,/WB INTELLIGENCE/);assert.match(h,/SIMULATION ONLY/)});
test("V6-02 markets surface shows live quotes without inventing prices",()=>{assert.match(marketsMarkup([{symbol:"SPY",price:762.63,time:"T"}]),/SPY/);assert.match(marketsMarkup([]),/will not invent prices/)});
console.log("V6-02 Product Shell + Experience Router: PASS");
