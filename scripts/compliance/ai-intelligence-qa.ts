import { validateIntelligenceArtifacts } from "../../src/lib/compliance/ai/intelligence/validate-intelligence";

async function main() {
  const result = await validateIntelligenceArtifacts();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
