import Link from "next/link";

import { VoterAudienceAvatar } from "@/components/election-plan/voter-audience/VoterAudienceAvatar";
import { epVoterAudienceProfileHref } from "@/lib/election-plan/debate-prep-links";
import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";

export function VoterAudienceBadge({
  profile,
  linked = true,
  size = "sm",
}: {
  profile: VoterAudienceProfile;
  linked?: boolean;
  size?: "sm" | "md";
}) {
  const inner = (
    <>
      <VoterAudienceAvatar profile={profile} size={size === "md" ? "md" : "sm"} />
      <span className="font-semibold text-[var(--ep-navy)]">{profile.displayName}</span>
      <span className="hidden text-[var(--ep-navy-muted)] sm:inline">· {profile.segmentLabel}</span>
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--ep-border)] bg-white px-2 py-1 text-xs";

  if (linked) {
    return (
      <Link href={epVoterAudienceProfileHref(profile.id)} className={`${className} hover:border-[var(--ep-gold)]`}>
        {inner}
      </Link>
    );
  }

  return <span className={className}>{inner}</span>;
}
