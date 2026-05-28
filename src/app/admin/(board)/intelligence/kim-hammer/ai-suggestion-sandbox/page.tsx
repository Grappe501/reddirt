import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerAiSuggestionSandboxBrowser } from "../KimHammerAiSuggestionSandboxBrowser";
import { resolveAiSuggestionDoctrineContext } from "@/lib/intelligence/campaignStrategicAlignment";
import {
  generateKimHammerLiveSuggestionCandidates,
  loadKimHammerAiSuggestionSandbox,
  summarizeKimHammerSuggestionSandbox,
} from "@/lib/opposition/kimHammerSuggestionSandbox";

export default async function KimHammerAiSuggestionSandboxPage() {
  const sandbox = loadKimHammerAiSuggestionSandbox();
  const summary = summarizeKimHammerSuggestionSandbox();
  const liveCandidates = generateKimHammerLiveSuggestionCandidates();
  const doctrineContexts = Object.fromEntries(
    sandbox.suggestions.map((suggestion) => [
      suggestion.id,
      resolveAiSuggestionDoctrineContext(suggestion),
    ]),
  );

  return (
    <KimHammerBriefingPageShell moduleId="ai-suggestion-sandbox">
      <KimHammerAiSuggestionSandboxBrowser
        sandbox={sandbox}
        summary={summary}
        liveCandidateCount={liveCandidates.length}
        doctrineContexts={doctrineContexts}
      />
    </KimHammerBriefingPageShell>
  );
}
