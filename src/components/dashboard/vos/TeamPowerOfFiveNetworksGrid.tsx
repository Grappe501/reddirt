import type { TeamPowerOfFiveMemberNetwork } from "@/types/dashboard";

import { TeamPowerOfFiveMemberCard } from "./TeamPowerOfFiveMemberCard";

export function TeamPowerOfFiveNetworksGrid({ networks }: { networks: TeamPowerOfFiveMemberNetwork[] }) {
  const gridClass =
    networks.length >= 3
      ? "grid grid-cols-1 gap-4 lg:grid-cols-3"
      : networks.length === 2
        ? "grid grid-cols-1 gap-4 md:grid-cols-2"
        : "grid grid-cols-1 gap-4";

  return (
    <div className={gridClass}>
      {networks.map((n) => (
        <TeamPowerOfFiveMemberCard key={n.memberId} network={n} />
      ))}
    </div>
  );
}
