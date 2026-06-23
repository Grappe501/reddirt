import { redirect } from "next/navigation";

import { EP_DEBATE_PREP_HREF } from "@/lib/election-plan/debate-prep-links";
import { isForumLabPublicHidden } from "@/lib/election-plan/kelly-facing-ui";

export default function ForumLabStudentGateLayout({ children }: { children: React.ReactNode }) {
  if (isForumLabPublicHidden()) {
    redirect(EP_DEBATE_PREP_HREF);
  }
  return children;
}
