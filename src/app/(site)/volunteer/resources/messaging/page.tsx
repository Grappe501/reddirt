import type { Metadata } from "next";

import { MessagingTalkingPointsContent } from "./MessagingTalkingPointsContent";

export const metadata: Metadata = {
  title: "Messaging & talking points · Volunteer resources",
  description: "Approved framing for volunteers — Kelly pillars, registration, triad model, Power of 5, and FAQs.",
};

export default function VolunteerMessagingPage() {
  return <MessagingTalkingPointsContent />;
}
