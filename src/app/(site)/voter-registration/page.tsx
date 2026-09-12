import type { Metadata } from "next";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";

export const metadata: Metadata = {
  title: "Voter registration center",
  description:
    "Register to vote and get help finding Arkansas’s official VoterView lookup, paper registration paths, 2026 election dates, and a campaign volunteer when you need a hand.",
};

export default async function VoterRegistrationPage() {
  const [trailPhoto] = trailPhotosForSlot("voterRegistration");
  return <VoterRegistrationCenter trailPhoto={trailPhoto ?? null} />;
}
