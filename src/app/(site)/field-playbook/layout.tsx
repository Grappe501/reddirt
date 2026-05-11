import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PublicFieldPlaybookExperience } from "@/components/volunteer/PublicFieldPlaybookExperience";

export const metadata: Metadata = {
  title: "Field playbook",
  description: "How county, city, precinct, and neighborhood teams work together in the three-person field model.",
};

export default function PublicFieldPlaybookLayout({ children }: { children: ReactNode }) {
  return <PublicFieldPlaybookExperience>{children}</PublicFieldPlaybookExperience>;
}
