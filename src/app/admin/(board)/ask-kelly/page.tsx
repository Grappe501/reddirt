import { AskKellyCommandConsole } from "@/components/admin/ask-kelly/AskKellyCommandConsole";
import { AskKellyOnboardingExperience } from "@/components/admin/ask-kelly/AskKellyOnboardingExperience";

export default function AskKellyCandidateOnboardingPage() {
  return (
    <AskKellyCommandConsole>
      <AskKellyOnboardingExperience />
    </AskKellyCommandConsole>
  );
}
