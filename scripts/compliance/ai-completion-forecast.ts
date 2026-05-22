import { writeCompletionForecastOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const forecast = await writeCompletionForecastOnly();
  console.log(JSON.stringify({ status: "ok", current: forecast.currentPercent, steps: forecast.steps.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
