import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";

export function VoterAudienceAvatar({
  profile,
  size = "md",
}: {
  profile: Pick<VoterAudienceProfile, "initials" | "avatarColor" | "displayName">;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${profile.avatarColor} ${dim}`}
      title={profile.displayName}
      aria-hidden
    >
      {profile.initials}
    </span>
  );
}
