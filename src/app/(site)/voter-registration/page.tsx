import type { Metadata } from "next";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";

export const metadata: Metadata = {
  title: "Voter registration",
  description:
    "Check your Arkansas voter registration on official VoterView. The campaign can help with paper registration if you need a person.",
};

export default function VoterRegistrationPage() {
  return <VoterRegistrationCenter />;
}
