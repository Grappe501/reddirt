import { readFileSync } from "node:fs";
import { buildDecisionSimulationUserPrompt } from "../src/lib/agents/decision-simulation/prompt";
import {
  CHANNEL_INTAKE_FIELDS,
  composeCorrespondenceOpening,
  parseCorrespondencePaste,
} from "../src/lib/agents/decision-simulation/correspondence-intake";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator correspondence intake");

const email = parseCorrespondencePaste(
  [
    "From: operator@example.test",
    "To: desk@example.test",
    "Subject: Housing follow-up",
    "Date: 2026-09-09",
    "",
    "Central Arkansas families are asking about housing costs.",
  ].join("\n"),
  "EMAIL",
);
assert(email.fields.from === "operator@example.test", "email From is parsed");
assert(email.fields.subject === "Housing follow-up", "email Subject is parsed");
assert(email.body.includes("housing costs"), "email body is the letter, not the headers");
assert(email.connectorsEnabled === false, "connectors stay disabled");
assert(email.unknown.includes("cc"), "missing Cc stays unknown");

const bare = parseCorrespondencePaste("Just a speech line about veterans.", "SPEECH");
assert(bare.body === "Just a speech line about veterans.", "headerless paste remains the body");
assert(bare.unknown.includes("venue") && !bare.fields.venue, "speech venue stays unknown unless supplied");

const debate = parseCorrespondencePaste(
  ["Occasion: Little Rock forum", "Question: How will you lower housing costs?", "", "We start with supply and wages."].join("\n"),
  "DEBATE",
);
assert(debate.fields.question === "How will you lower housing costs?", "debate question is structured separately");
assert(debate.body === "We start with supply and wages.", "debate answer is the opening move body");

const memo = parseCorrespondencePaste("Re: Budget vote\nTo: Research desk\n\nHold the line on documented votes only.", "MEMO");
assert(memo.fields.re === "Budget vote", "memo Re line is parsed");
assert(!memo.fields.from, "missing memo From is not invented");

const composed = composeCorrespondenceOpening({
  channel: "EMAIL",
  paste: "Subject: Test\n\nBody only.",
  fieldOverrides: { to: "desk@example.test" },
});
assert(composed.message === "Body only.", "compose uses the pasted body as the opening move");
assert(composed.intake.fields.to === "desk@example.test", "operator-typed fields merge without replacing the body");
assert(composed.intakePacket.includes("Connectors=DISABLED"), "intake packet forbids mailbox fetch");
assert(!composed.intakePacket.includes("invented-person@"), "compose does not invent recipients");

const prompt = buildDecisionSimulationUserPrompt({
  message: composed.message,
  channel: "EMAIL",
  intake: composed.intake,
});
assert(prompt.includes("CORRESPONDENCE INTAKE"), "simulation prompt includes the intake packet");
assert(prompt.includes("Subject: Test"), "prompt keeps parsed subject");

assert(CHANNEL_INTAKE_FIELDS.EMAIL.some((field) => field.key === "subject"), "email taxonomy includes subject");
assert(CHANNEL_INTAKE_FIELDS.DEBATE.some((field) => field.key === "question"), "debate taxonomy includes question");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(ui.includes("Paste correspondence") && ui.includes("stakes"), "dashboard exposes paste-first intake and stakes");
assert(!/imap|gmail\.googleapis/i.test(ui) && ui.includes("No mailbox connector"), "UI forbids mailbox connectors instead of adding one");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-CORRESPONDENCE-INTAKE-1.0"), "Phase 6 slice is named on the canonical roadmap");

console.log("OK — correspondence intake gates passed");
