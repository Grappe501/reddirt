import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";

export const metadata: Metadata = {
  title: "Muslim Community Region · Social / Communications",
  description: "Community-approved messaging and social coordination.",
};

export default function MuslimCommunitySocialPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Social / Communications</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Community-approved messaging — coordinated with the campaign Social Media lead. Supports Youth and Women&apos;s lanes
          with tone, privacy, and guardian or family context where it matters. Escalate paid boosts and legal disclosure questions
          upstream before spending.
        </p>
        <p className="mt-4 font-body text-sm text-kelly-text/85">
          Approved Kelly cutouts and Canva guidance:{" "}
          <Link href="/volunteer/resources/social-media-design" className="font-semibold text-kelly-blue underline">
            Social media and design hub
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
