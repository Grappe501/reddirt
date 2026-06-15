/**
 * Event outcome learning — compare predicted vs actual scores.
 *
 * Usage: npm run campaign-brain:learning:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { actualOutcomeScore, outcomeDelta } from "./lib/feedback-types";
import { loadEventOutcomes } from "./lib/feedback-load";
import { BRAIN_ROOT, readJson, fmt } from "./lib/inputs";

function main() {
  const raw = readJson<{ outcomes: unknown[]; _examples?: unknown[] }>(
    path.join(process.cwd(), "data/campaign-brain/event-outcomes.json"),
  );
  const logged = loadEventOutcomes();
  const examples = (raw?._examples ?? []) as typeof logged;

  const all = [...logged, ...examples.filter((e) => !logged.some((l) => l.eventId === e.eventId))];

  const rows = all.map((o) => {
    const actual = actualOutcomeScore(o);
    const delta = outcomeDelta(o.predictedScore, actual);
    return {
      eventId: o.eventId,
      title: o.title,
      county: o.county,
      eventDate: o.eventDate,
      predictedScore: o.predictedScore,
      actualScore: actual,
      delta,
      accuracy: o.predictedScore > 0 ? Math.round((1 - Math.abs(delta) / 100) * 100) : 0,
      attended: o.attended,
      metrics: {
        newContacts: o.newContacts ?? 0,
        volunteerSignups: o.volunteerSignups ?? 0,
        registrationFormsCompleted: o.registrationFormsCompleted ?? 0,
        faithLeadersEngaged: o.faithLeadersEngaged ?? 0,
        clerkRelationshipAdvanced: o.clerkRelationshipAdvanced ?? false,
        earnedMediaGenerated: o.earnedMediaGenerated ?? false,
      },
    };
  });

  rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const overPredicted = rows.filter((r) => r.delta < -10);
  const underPredicted = rows.filter((r) => r.delta > 10);

  const output = {
    generatedAt: new Date().toISOString(),
    totalOutcomes: rows.length,
    note: rows.length === 0 ? "Log outcomes in data/campaign-brain/event-outcomes.json" : undefined,
    calibration: {
      meanAbsoluteError: rows.length ? Math.round(rows.reduce((s, r) => s + Math.abs(r.delta), 0) / rows.length) : null,
      overPredictedCount: overPredicted.length,
      underPredictedCount: underPredicted.length,
    },
    comparisons: rows,
    insights:
      rows.length >= 2
        ? [
            underPredicted.length > 0
              ? `Under-predicted: ${underPredicted.map((r) => r.title).join(", ")} — consider boosting relationship/chamber event weights.`
              : null,
            overPredicted.length > 0
              ? `Over-predicted: ${overPredicted.map((r) => r.title).join(", ")} — verify attendance assumptions.`
              : null,
          ].filter(Boolean)
        : [],
  };

  const dir = path.join(BRAIN_ROOT, "feedback-loops");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "event-learning.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# Event Outcome Learning

> Was the recommendation correct?

Log outcomes in [\`data/campaign-brain/event-outcomes.json\`](../../data/campaign-brain/event-outcomes.json).

---

## Calibration

| Metric | Value |
| ------ | ----- |
| Outcomes logged | ${rows.length} |
| Mean absolute error | ${output.calibration.meanAbsoluteError ?? "—"} |
| Over-predicted (>10 pts) | ${overPredicted.length} |
| Under-predicted (>10 pts) | ${underPredicted.length} |

---

## Predicted vs actual

| Event | Predicted | Actual | Delta |
| ----- | --------: | -----: | ----: |
${rows.map((r) => `| ${r.title} | ${r.predictedScore} | ${r.actualScore} | ${r.delta >= 0 ? "+" : ""}${r.delta} |`).join("\n") || "| — | — | — | — |"}

${output.insights.length ? `\n## Insights\n\n${output.insights.map((i) => `- ${i}`).join("\n")}` : ""}

---

## Outcome fields (per event)

- Attended (Y/N)
- Estimated attendance
- New contacts · Volunteer signups · Registration forms
- Faith leaders engaged · Clerk relationship advanced · Earned media
`;

  writeFileSync(path.join(dir, "event-learning.md"), md, "utf8");
  writeFileSync(
    path.join(dir, "README.md"),
    `# Feedback Loops

| Artifact | Purpose |
| -------- | ------- |
| [Event learning](./event-learning.md) | Predicted vs actual event scores |
| [Captured opportunity](../measurement/captured-opportunity.md) | Execution vs potential |

## Workflow

1. Brain recommends event (predicted score)
2. Field team executes
3. Log outcome in \`data/campaign-brain/event-outcomes.json\`
4. Update \`data/campaign-brain/captured-progress.json\`
5. \`npm run campaign-brain:build\`
`,
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(`Event learning: ${rows.length} outcomes, MAE ${output.calibration.meanAbsoluteError ?? "n/a"}.`);
}

main();
