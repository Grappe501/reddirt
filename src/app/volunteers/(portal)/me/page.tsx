import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { VolunteerBoardOnboardingWizard } from "@/components/volunteers/board/VolunteerBoardOnboardingWizard";
import { VolunteerPersonalBoardView } from "@/components/volunteers/board/VolunteerPersonalBoardView";
import {
  loadVolunteerBoardSnapshot,
  tryLoadVolunteerBoardSession,
} from "@/lib/volunteers/board/load-volunteer-board";

export const metadata: Metadata = {
  title: "My volunteer board",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams?: Promise<{ onboarding?: string; error?: string }> };

export default async function VolunteerPersonalBoardPage({ searchParams }: Props) {
  const session = await tryLoadVolunteerBoardSession();
  if (!session) redirect("/volunteers/sign-in");

  const snapshot = await loadVolunteerBoardSnapshot(session.userId, session.volunteerProfileId);
  if (!snapshot) redirect("/volunteers/sign-in?error=unknown");

  const params = (await searchParams) ?? {};
  const forceOnboarding = params.onboarding === "1";
  const showOnboarding = snapshot.needsOnboarding || forceOnboarding;

  if (showOnboarding) {
    return <VolunteerBoardOnboardingWizard snapshot={snapshot} error={params.error ?? null} />;
  }

  return <VolunteerPersonalBoardView snapshot={snapshot} />;
}
