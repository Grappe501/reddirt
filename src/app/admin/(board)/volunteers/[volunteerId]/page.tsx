import { notFound } from "next/navigation";
import { VolunteerProfileClient } from "@/components/admin/volunteers/VolunteerProfileClient";
import { buildVolunteerCommunicationDraft } from "@/lib/campaign-events/volunteers/volunteer-communications-planner";
import { buildVolunteerTrainingPath } from "@/lib/campaign-events/volunteers/volunteer-training-engine";
import { getVolunteerById, loadVolunteersStore } from "@/lib/campaign-events/volunteers/volunteer-storage";

export const dynamic = "force-dynamic";

export default async function VolunteerProfilePage({ params }: { params: Promise<{ volunteerId: string }> }) {
  const { volunteerId } = await params;
  const profile = getVolunteerById(volunteerId);
  if (!profile) notFound();
  const store = loadVolunteersStore();
  const trainingPath = buildVolunteerTrainingPath(profile, store.training);
  const drafts = [
    buildVolunteerCommunicationDraft(profile, "welcome", { onboardingUrl: "/volunteer" }),
    buildVolunteerCommunicationDraft(profile, "training_reminder", { moduleTitle: trainingPath.recommendedNext[0] ?? "campaign basics" }),
    buildVolunteerCommunicationDraft(profile, "thank_you", { eventTitle: "recent event" }),
  ];
  return (
    <VolunteerProfileClient
      profile={JSON.parse(JSON.stringify(profile))}
      trainingPath={JSON.parse(JSON.stringify(trainingPath))}
      drafts={JSON.parse(JSON.stringify(drafts))}
    />
  );
}
