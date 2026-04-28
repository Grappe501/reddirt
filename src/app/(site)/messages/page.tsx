import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { NarrativeMemberHubView } from "@/components/narrative-distribution/public/NarrativeMemberHubView";
import { buildPublicMemberHubModel } from "@/lib/narrative-distribution/public-member-hub";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Stories & voices — volunteer message hub",
  description:
    "This week’s line, prompts for your five, county packets, share copy, and listening questions—built for relational organizing. Some items may show preview copy until approvals publish.",
  path: "/messages",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default function MessagesMemberHubPage() {
  const model = buildPublicMemberHubModel();

  return (
    <>
      <PageHero
        eyebrow="Message hub"
        title="Stories & voices"
        subtitle="This week’s relational line in one place—prompts for your five, county packets, share copy, and what’s next for volunteers. Some blocks may show previews until final copy is published."
        tone="plan"
      />
      <NarrativeMemberHubView model={model} />
    </>
  );
}
