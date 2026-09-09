import { readFileSync } from "node:fs";
import {
  composeCorrespondenceOpening,
  parseCorrespondencePaste,
} from "../src/lib/agents/decision-simulation/correspondence-intake";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator channel-native paste");

const social = parseCorrespondencePaste(
  ["@example_desk", "Housing costs are the issue this week.", "", "https://x.com/example_desk/status/1"].join("\n"),
  "SOCIAL",
);
assert(social.fields.handle === "@example_desk", "a leading @handle is the social handle");
assert(social.fields.platform === "X", "an x.com URL sets platform");
assert(social.body.includes("Housing costs"), "the post body stays the opening move");
assert(social.inferred.includes("handle") && social.inferred.includes("platform"), "social fields are marked inferred");
assert(social.unknown.includes("audience"), "missing social audience stays unknown");

const sms = parseCorrespondencePaste("(501) 555-0199\nCan you meet Thursday?", "SMS");
assert(sms.fields.from === "(501) 555-0199", "a standalone phone line is the SMS sender");
assert(sms.body === "Can you meet Thursday?", "the text body is the opening move");

const press = parseCorrespondencePaste(
  "LITTLE ROCK, Ark. (AP) — Families asked about housing costs at the forum.",
  "PRESS_STATEMENT",
);
assert(press.fields.outlet === "AP", "a dateline outlet is parsed");
assert(press.body.includes("Families asked"), "the press body is not dropped");
assert(!press.fields.headline, "a dateline-only paste does not invent a headline");

const debate = parseCorrespondencePaste(
  ["Q. How will you lower housing costs?", "", "We start with supply and wages."].join("\n"),
  "DEBATE",
);
assert(debate.fields.question === "How will you lower housing costs?", "an unlabeled Q. line is the debate question");
assert(debate.body === "We start with supply and wages.", "the debate answer is the opening move");

const speech = parseCorrespondencePaste("Just a speech line about veterans.", "SPEECH");
assert(!speech.fields.venue && speech.inferred.length === 0, "a headerless speech does not invent a venue");

const labeled = parseCorrespondencePaste("From: operator@example.test\nSubject: Housing\n\nBody only.", "EMAIL");
assert(labeled.fields.from === "operator@example.test", "labeled headers still win");
assert(!labeled.inferred.includes("from"), "a labeled From is not marked inferred");

const composed = composeCorrespondenceOpening({
  channel: "SOCIAL",
  paste: "@example_desk\nHousing costs are the issue.\nhttps://x.com/example_desk/status/1",
});
assert(composed.intakePacket.includes("Inferred from unlabeled paste"), "intake packet names unlabeled inference");
assert(composed.intakePacket.includes("Connectors=DISABLED"), "native paste is still not a mailbox fetch");
assert(!composed.intakePacket.includes("invented-person"), "native paste does not invent recipients");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(ui.includes("Unlabeled paste filled"), "dashboard names unlabeled field fill");
assert(!/imap|gmail\.googleapis/i.test(ui), "native paste UI does not add a mailbox connector");

const native = readFileSync("src/lib/agents/decision-simulation/correspondence-intake/native-fields.ts", "utf8");
assert(!/openai|fetch\(/i.test(native), "native paste does not call a model or fetch a URL");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-CHANNEL-NATIVE-PASTE-1.0"), "native paste slice is named on the canonical roadmap");
assert(
  roadmap.includes("DEC-SIM-CORRESPONDENCE-INTAKE-1.0") &&
    roadmap.includes("DEC-SIM-CORRESPONDENCE-THREAD-1.0") &&
    roadmap.includes("DEC-SIM-HOSTED-ENSEMBLE-PROOF-1.0"),
  "prior capability names stay on the canonical roadmap",
);
assert(roadmap.includes("V2-39") && roadmap.includes("V2-41"), "mailbox import and channel auto-switch stay V2");
assert(/Phase 6/i.test(roadmap) && /capability started/i.test(roadmap), "this slice does not close Phase 6");
assert(/Phase 5 remains open/i.test(roadmap), "this slice does not close Phase 5");

console.log("OK — channel-native paste gates passed");
