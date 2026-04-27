import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { NarrativeMemberHubView } from "@/components/narrative-distribution/public/NarrativeMemberHubView";
import { buildPublicMemberHubModel } from "@/lib/narrative-distribution/public-member-hub";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Conversations & Stories — volunteer message hub",
  description:
    "This week’s line, prompts for your five, county packets, share copy, listening questions, and narrative priorities—built for relational organizing. Content is demo or queued until approvals connect to the live comms stack.",
  path: "/messages",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default function MessagesMemberHubPage() {
  const model = buildPublicMemberHubModel();

  return (
    <>
      <PageHero
        eyebrow="Message hub"
        title="Conversations & Stories"
        subtitle="Everything you need for this week’s relational work in one scroll: the line, prompts for your five, county packets, share copy, and what’s next in the narrative queue. Still demo/seed until approvals land — Stories, Blog, and the workbench remain the system of record."
        tone="plan"
      />
      <NarrativeMemberHubView model={model} />
    </>
  );
}
