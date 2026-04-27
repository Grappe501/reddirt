import type { Metadata } from "next";
import { PowerOf5OnboardingView } from "@/components/onboarding/power-of-5";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Power of 5 — relational organizing walkthrough",
  description:
    "Step-by-step introduction to the Power of 5: how relational outreach scales, what to track, and how dashboards fit together. Uses demo and training content only—no contact or voter data is collected here.",
  path: "/onboarding/power-of-5",
});

export default function PowerOf5OnboardingPage() {
  return <PowerOf5OnboardingView />;
}
