import type { Metadata } from "next";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";

export const metadata: Metadata = {
  title: "Voter registration center",
  description:
    "Register to vote and get help finding Arkansas’s official VoterView lookup, paper registration paths, and a campaign volunteer when you need a hand.",
};

export default async function VoterRegistrationPage() {
  return <VoterRegistrationCenter />;
}
