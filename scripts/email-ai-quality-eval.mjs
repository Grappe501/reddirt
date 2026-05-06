#!/usr/bin/env node
/**
 * EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0
 * Repeatable static/sample evaluation — no real PII, no sends.
 * - Loads synthetic fixtures from data/email-ai-eval-fixtures.json
 * - Heuristic rubric scores (always)
 * - Optional OpenAI JSON adjudication when OPENAI_API_KEY is set (never prints the key)
 * - Writes data/email-ai-quality-eval-report.json + docs/email-ai-quality-eval-report.md
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FIXTURES_PATH = path.join(ROOT, "data", "email-ai-eval-fixtures.json");
const OUT_JSON = path.join(ROOT, "data", "email-ai-quality-eval-report.json");
const OUT_MD = path.join(ROOT, "docs", "email-ai-quality-eval-report.md");

const RUBRIC_DIMENSIONS = [
  "voice_fit",
  "clarity",
  "cta_quality",
  "source_discipline",
  "no_unsupported_claims",
  "risk_flagging",
  "audience_fit",
  "compliance_caution",
  "usefulness",
];

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function avgSentenceLen(s) {
  const parts = s.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return 0;
  return parts.reduce((a, b) => a + wordCount(b), 0) / parts.length;
}

/**
 * Deterministic 1–5 scores + notes. Not a substitute for human review.
 * @param {{ scenarioType: string; sampleAiOutput: string; title?: string }} fixture
 */
function heuristicRubric(fixture) {
  const text = fixture.sampleAiOutput || "";
  const lower = text.toLowerCase();
  const wc = wordCount(text);
  const asl = avgSentenceLen(text);

  const notes = [];

  const hasCta =
    /\b(rsvp|reply|sign up|signup|donate|chip in|volunteer|register|confirm|yes|join us|take action)\b/i.test(text);
  const hasHedge = /\b(if applicable|placeholder|replace|approved|needs source|counsel|finance|review)\b/i.test(text);
  const riskyStats = /\b\d{1,3}\s*%\b|\bpoll(s)?\b|\bproven\b|\bguarantee\b|\blead(s)?\b.*\d/i.test(text);
  const citesProcess = /\b(official|secretary of state|comms|counsel|approved|wiki|internal)\b/i.test(text);
  const shouty = /[A-Z]{10,}/.test(text.replace(/\s+/g, " "));
  const manyBang = (text.match(/!!+/g) || []).length > 0;
  const complianceCue = /\b(finance|compliance|suppress|opt.?in|unsubscribe|legal)\b/i.test(text);
  const audienceCue = /\b(audience|county|voter|subscriber|segment)\b/i.test(text);
  const riskCue = /\b(escalate|threat|contrast|remove|critique|risk)\b/i.test(text);

  let clarity = 3;
  if (wc < 8) {
    clarity = 2;
    notes.push("Very short output — may lack structure.");
  } else if (asl > 35) {
    clarity = 2;
    notes.push("Long average sentence length — skimmability risk.");
  } else if (asl <= 22 && wc >= 20) {
    clarity = 4;
  }

  let cta_quality = hasCta ? 4 : 2;
  if (hasCta && lower.includes("reply")) cta_quality = Math.min(5, cta_quality + 1);

  let source_discipline = hasHedge || citesProcess ? 4 : riskyStats ? 2 : 3;
  if (lower.includes("needs source")) {
    source_discipline = 5;
    notes.push("Explicit needs-source discipline.");
  }

  let no_unsupported_claims = riskyStats && !lower.includes("remove") && !lower.includes("approved citation") ? 2 : 4;
  if (fixture.scenarioType === "draft_critique" && /\b(remove|add approved)\b/i.test(text)) {
    no_unsupported_claims = 5;
  }

  let risk_flagging = riskCue || fixture.scenarioType === "press_response" ? 4 : 3;
  if (fixture.scenarioType === "draft_critique") risk_flagging = 5;

  let audience_fit = audienceCue || fixture.scenarioType === "audience_strategy" ? 4 : 3;

  let compliance_caution = complianceCue || hasHedge ? 4 : 3;
  if (fixture.scenarioType === "donor_thank_you" && lower.includes("do not promise")) compliance_caution = 5;

  let voice_fit = 3;
  if (["volunteer_follow_up", "donor_thank_you", "press_response"].includes(fixture.scenarioType)) voice_fit = 4;
  if (shouty || manyBang) {
    voice_fit = 2;
    notes.push("Shouty punctuation / caps risk.");
  }

  let usefulness = 3;
  if (wc >= 25 && hasCta) usefulness = 4;
  if (fixture.scenarioType === "queue_triage_summary" && lower.includes("next step")) usefulness = 5;
  if (fixture.scenarioType === "task_recommendation" && lower.includes("operator")) usefulness = 5;

  const scores = {
    voice_fit,
    clarity,
    cta_quality,
    source_discipline,
    no_unsupported_claims,
    risk_flagging,
    audience_fit,
    compliance_caution,
    usefulness,
  };
  for (const k of RUBRIC_DIMENSIONS) {
    scores[k] = clamp(scores[k] ?? 3, 1, 5);
  }

  const overall =
    RUBRIC_DIMENSIONS.reduce((a, k) => a + scores[k], 0) / (RUBRIC_DIMENSIONS.length * 5);

  return { scores, notes, overall01: round1(overall) };
}

async function openAiAdjudicate(fixture, heuristic) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const body = {
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You evaluate synthetic campaign/ops AI text for quality. JSON only.",
          "Score each rubric dimension from 1 (poor) to 5 (strong).",
          "Dimensions: " + RUBRIC_DIMENSIONS.join(", "),
          "No PII in your response. Never invent facts about the text.",
          'Return JSON: {"scores": { "<dim>": {"score": number, "note": string} }, "summaryLine": string }',
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          scenarioType: fixture.scenarioType,
          title: fixture.title,
          sampleAiOutput: fixture.sampleAiOutput.slice(0, 6000),
          heuristicScoresForReference: heuristic.scores,
        }),
      },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { error: `OpenAI HTTP ${res.status}`, detail: t.slice(0, 400) };
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return { error: "OpenAI empty content" };
  try {
    const j = JSON.parse(raw);
    const out = {};
    for (const dim of RUBRIC_DIMENSIONS) {
      const cell = j.scores?.[dim];
      const sc = typeof cell?.score === "number" ? clamp(Math.round(cell.score), 1, 5) : null;
      if (sc != null) out[dim] = { score: sc, note: typeof cell?.note === "string" ? cell.note.slice(0, 400) : "" };
    }
    return {
      scores: out,
      summaryLine: typeof j.summaryLine === "string" ? j.summaryLine.slice(0, 500) : "",
    };
  } catch {
    return { error: "OpenAI JSON parse failed", raw: raw.slice(0, 300) };
  }
}

function mergeScores(heuristic, llm) {
  if (!llm || !llm.scores) return null;
  const merged = {};
  for (const dim of RUBRIC_DIMENSIONS) {
    const h = heuristic.scores[dim];
    const l = llm.scores[dim]?.score;
    if (typeof l === "number") merged[dim] = round1(Math.min(h, l));
    else merged[dim] = h;
  }
  const overall =
    RUBRIC_DIMENSIONS.reduce((a, k) => a + merged[k], 0) / (RUBRIC_DIMENSIONS.length * 5);
  return { merged, overall01: round1(overall) };
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Email AI quality evaluation report");
  lines.push("");
  lines.push(`**Generated:** ${report.generatedAt}`);
  lines.push(`**Harness:** EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0`);
  lines.push(`**Mode:** ${report.mode}`);
  lines.push(`**OpenAI adjudication:** ${report.openAiAdjudication}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Fixtures evaluated: **${report.summary.fixtureCount}**`);
  lines.push(`- Mean heuristic overall (0–1): **${report.summary.meanHeuristicOverall}**`);
  lines.push(
    `- Mean LLM overall (0–1): **${report.summary.meanLlmOverall != null ? report.summary.meanLlmOverall : "n/a (static run)"}**`,
  );
  lines.push(`- Mean conservative merge (0–1, where LLM ran): **${report.summary.meanMergedOverall ?? "n/a"}**`);
  lines.push("");
  lines.push("## Rubric dimensions");
  lines.push("");
  lines.push(RUBRIC_DIMENSIONS.map((d) => `- \`${d}\``).join("\n"));
  lines.push("");
  lines.push("## Per scenario");
  lines.push("");
  lines.push("| Scenario | Type | Heuristic overall | LLM | Notes |");
  lines.push("|---|---|---:|---:|---|");
  for (const row of report.scenarios) {
    const h = row.heuristicOverall01;
    const l = row.llmOverall01 != null ? String(row.llmOverall01) : "—";
    const n = mdEscape((row.heuristicNotes || []).concat(row.llmError ? [row.llmError] : []).join("; ").slice(0, 200));
    lines.push(`| ${mdEscape(row.title)} | \`${row.scenarioType}\` | ${h} | ${l} | ${n} |`);
  }
  lines.push("");
  lines.push("## Safety");
  lines.push("");
  lines.push("- Synthetic fixtures only — no live sends, no real contacts.");
  lines.push("- This report is **not** a compliance sign-off.");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const staticOnly =
    process.argv.includes("--static-only") || process.env.EMAIL_AI_EVAL_SKIP_OPENAI === "1";
  if (!fs.existsSync(FIXTURES_PATH)) {
    console.error("Missing fixtures:", FIXTURES_PATH);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(FIXTURES_PATH, "utf8"));
  const fixtures = Array.isArray(raw.fixtures) ? raw.fixtures : [];
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY?.trim()) && !staticOnly;

  const scenarios = [];
  let sumH = 0;
  let sumL = 0;
  let sumM = 0;
  let llmCount = 0;
  let mergeCount = 0;

  for (const f of fixtures) {
    const heuristic = heuristicRubric(f);
    sumH += heuristic.overall01;
    let llm = null;
    let llmError = null;
    if (hasOpenAi) {
      llm = await openAiAdjudicate(f, heuristic);
      if (llm?.error) {
        llmError = llm.error + (llm.detail ? `: ${llm.detail}` : "");
        llm = null;
      }
    }
    let llmOverall01 = null;
    if (llm?.scores) {
      const vals = RUBRIC_DIMENSIONS.map((k) => llm.scores[k]?.score).filter((x) => typeof x === "number");
      if (vals.length) {
        llmOverall01 = round1(vals.reduce((a, b) => a + b, 0) / (vals.length * 5));
        sumL += llmOverall01;
        llmCount++;
      }
    }
    let mergedRow = null;
    if (llm?.scores) {
      mergedRow = mergeScores(heuristic, llm);
      if (mergedRow) {
        sumM += mergedRow.overall01;
        mergeCount++;
      }
    }
    scenarios.push({
      id: f.id,
      scenarioType: f.scenarioType,
      title: f.title,
      heuristicScores: heuristic.scores,
      heuristicNotes: heuristic.notes,
      heuristicOverall01: heuristic.overall01,
      llmScores: llm?.scores ?? null,
      llmSummaryLine: llm?.summaryLine ?? null,
      llmOverall01,
      mergedScores: mergedRow?.merged ?? null,
      mergedOverall01: mergedRow?.overall01 ?? null,
      llmError,
    });
  }

  const report = {
    version: 1,
    packet: "EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0",
    generatedAt: new Date().toISOString(),
    mode: hasOpenAi ? "heuristic_plus_openai" : "static_readiness",
    openAiAdjudication: hasOpenAi
      ? "attempted_per_fixture"
      : staticOnly
        ? "skipped_static_only_cli"
        : "skipped_no_api_key",
    rubricDimensions: RUBRIC_DIMENSIONS,
    summary: {
      fixtureCount: scenarios.length,
      meanHeuristicOverall: scenarios.length ? round1(sumH / scenarios.length) : 0,
      meanLlmOverall: llmCount ? round1(sumL / llmCount) : null,
      meanMergedOverall: mergeCount ? round1(sumM / mergeCount) : null,
    },
    scenarios,
    readme: "Synthetic fixtures in data/email-ai-eval-fixtures.json — edit there to tune scenarios.",
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_MD, buildMarkdown(report), "utf8");

  console.log("EMAIL-AI-QUALITY-EVAL-HARNESS — OK");
  console.log("  mode:", report.mode);
  console.log("  JSON:", path.relative(ROOT, OUT_JSON));
  console.log("  MD:  ", path.relative(ROOT, OUT_MD));
  console.log("  mean heuristic overall:", report.summary.meanHeuristicOverall);
  if (staticOnly) {
    console.log("  (--static-only or EMAIL_AI_EVAL_SKIP_OPENAI=1 — heuristic only; no OpenAI calls.)");
  } else if (!process.env.OPENAI_API_KEY?.trim()) {
    console.log("  (OPENAI_API_KEY unset — static readiness only; heuristic scores still written.)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
