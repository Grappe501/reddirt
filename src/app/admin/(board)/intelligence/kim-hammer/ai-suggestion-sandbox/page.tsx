import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerAiSuggestionSandboxBrowser } from "../KimHammerAiSuggestionSandboxBrowser";
import {
  generateKimHammerLiveSuggestionCandidates,
  loadKimHammerAiSuggestionSandbox,
  summarizeKimHammerSuggestionSandbox,
} from "@/lib/opposition/kimHammerSuggestionSandbox";

export default async function KimHammerAiSuggestionSandboxPage() {
  const sandbox = loadKimHammerAiSuggestionSandbox();
  const summary = summarizeKimHammerSuggestionSandbox();
  const liveCandidates = generateKimHammerLiveSuggestionCandidates();

  return (
    <KimHammerBriefingPageShell moduleId="ai-suggestion-sandbox">
      <KimHammerAiSuggestionSandboxBrowser
        sandbox={sandbox}
        summary={summary}
        liveCandidateCount={liveCandidates.length}
      />
    </KimHammerBriefingPageShell>
  );
}
