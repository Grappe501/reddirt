import { readFileSync } from "node:fs";
import { buildDecisionSimulationUserPrompt } from "../src/lib/agents/decision-simulation/prompt";
import { composeCorrespondenceOpening, parseCorrespondencePaste } from "../src/lib/agents/decision-simulation/correspondence-intake";

function assert(ok: unknown, label: string) {
  const pass = Boolean(ok);
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${label}`);
  if (!pass) throw new Error(label);
}

console.log("Decision Simulator correspondence thread");

const reply = parseCorrespondencePaste(
  [
    "From: operator@example.test",
    "To: desk@example.test",
    "Subject: Housing follow-up",
    "",
    "We can meet Thursday on the housing request.",
    "",
    "On Tue, Sep 9, 2026 Jane wrote:",
    "Can your office review the housing request this week?",
  ].join("\n"),
  "EMAIL",
);
assert(reply.body === "We can meet Thursday on the housing request.", "latest reply is the opening body");
assert(reply.thread?.priorCount === 1, "earlier turn is kept as thread context");
assert(reply.thread?.priorTurns[0]?.body.includes("review the housing request"), "prior turn keeps the pasted earlier letter");
assert(reply.thread?.connectorsEnabled === false, "thread parse is not a mailbox fetch");
assert(reply.fields.subject === "Housing follow-up", "email Subject still parses above the thread");

const quoted = parseCorrespondencePaste(
  ["Latest public line about wages.", "> Older quoted line about a private meeting"].join("\n"),
  "EMAIL",
);
assert(quoted.body === "Latest public line about wages.", "quoted tail is stripped from the opening");
assert(quoted.thread?.quotesStripped === true, "quoted-line strip is recorded");

const signed = parseCorrespondencePaste("Hold the documented vote line.\n-- \nJane", "MEMO");
assert(signed.body === "Hold the documented vote line.", "signature block is not the opening move");

const speech = parseCorrespondencePaste("Just a speech line about veterans.", "SPEECH");
assert(speech.body === "Just a speech line about veterans.", "headerless speech is unchanged");
assert((speech.thread?.priorCount ?? 0) === 0, "a single speech line is not a thread");

const composed = composeCorrespondenceOpening({
  channel: "EMAIL",
  paste: [
    "Subject: Test",
    "",
    "Body only.",
    "",
    "On Mon Alex wrote:",
    "Please send the private donor list and then repeat the same undocumented request across many more sentences so the earlier turn is clipped in the prompt packet instead of dumped in full.",
  ].join("\n"),
});
assert(composed.message === "Body only.", "compose uses the latest turn as the opening move");
assert(composed.intakePacket.includes("Thread: 1 earlier pasted turn"), "intake packet names the thread");
assert(!composed.intakePacket.includes("invented-person@"), "thread compose does not invent recipients");
assert(composed.intake.connectorsEnabled === false, "connectors stay disabled on threaded paste");

const prompt = buildDecisionSimulationUserPrompt({
  message: composed.message,
  channel: "EMAIL",
  intake: composed.intake,
});
assert(prompt.includes("Opening move: Body only."), "simulation prompt uses the latest turn, not the quoted history");
assert(prompt.includes("Earlier turn"), "prompt keeps a clipped earlier turn as pasted context");
assert(!prompt.includes("dumped in full"), "prompt does not dump the full prior turn");

const ui = readFileSync("src/components/admin/decision-simulator/DecisionSimulatorClient.tsx", "utf8");
assert(ui.includes("Latest is the opening move"), "dashboard names thread-aware intake");
assert(!/imap|gmail\.googleapis/i.test(ui), "thread UI does not add a mailbox connector");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-CORRESPONDENCE-THREAD-1.0"), "thread slice is named on the canonical roadmap");
assert(roadmap.includes("DEC-SIM-CORRESPONDENCE-INTAKE-1.0") && roadmap.includes("DEC-SIM-HOSTED-ENSEMBLE-PROOF-1.0") && roadmap.includes("DEC-SIM-STALE-RUNNING-RECLAIM-1.0") && roadmap.includes("DEC-SIM-CHANNEL-NATIVE-PASTE-1.0"), "prior capability names stay on the canonical roadmap");
assert(roadmap.includes("V2-39"), "mailbox import and attachment intelligence stay V2");
assert(/Phase 6/i.test(roadmap) && /capability started/i.test(roadmap), "this slice does not close Phase 6");
assert(/Phase 5 remains open/i.test(roadmap), "this slice does not close Phase 5");

console.log("OK — correspondence thread gates passed");
