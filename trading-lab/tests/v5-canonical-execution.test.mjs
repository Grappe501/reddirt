import test from "node:test";
import assert from "node:assert/strict";
import {canonicalExecution,compareExecutionParity} from "../src/v5-canonical-execution.js";
const market={price:100,observedAt:"2026-09-21T13:30:01Z",sessionOpen:true};
const base={symbol:"ABC",side:"BUY",quantity:10,orderType:"MARKET",submittedAt:"2026-09-21T13:30:00Z"};
test("V5-08 human and AI receive identical canonical execution",()=>{const h=canonicalExecution({order:{...base,orderId:"h",ownerType:"HUMAN"},market,costModel:{commission:1,slippageBps:5}});const a=canonicalExecution({order:{...base,orderId:"a",ownerType:"WEALTH_BUILDER_AI"},market,costModel:{commission:1,slippageBps:5}});assert.equal(compareExecutionParity(h,a).parity,true);assert.equal(h.executionPrice,100.05);});
test("V5-08 rejects closed session and pre-order observation",()=>{assert.throws(()=>canonicalExecution({order:{...base,orderId:"h",ownerType:"HUMAN"},market:{...market,sessionOpen:false}}));assert.throws(()=>canonicalExecution({order:{...base,orderId:"h",ownerType:"HUMAN"},market:{...market,observedAt:"2026-09-21T13:29:59Z"}}));});
test("V5-08 fill is immutable and simulation only",()=>{const f=canonicalExecution({order:{...base,orderId:"h",ownerType:"HUMAN"},market});assert.equal(f.realMoney,false);assert.equal(Object.isFrozen(f),true);});
console.log("V5-08 Canonical Execution Engine: PASS");
