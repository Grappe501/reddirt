import type { Metadata } from "next";

import { EmailTemplatesContent } from "./EmailTemplatesContent";

export const metadata: Metadata = {
  title: "Email templates · Volunteer resources",
  description: "Copy-ready email shells for volunteer invitation, downstream placement, events, and follow-up.",
};

export default function VolunteerEmailTemplatesPage() {
  return <EmailTemplatesContent />;
}
