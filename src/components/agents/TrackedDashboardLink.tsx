"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAgentObservation } from "./AgentObservationTracker";

export function TrackedDashboardLink({
  href,
  cardLabel,
  className,
  children,
}: {
  href: string;
  cardLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const { track } = useAgentObservation();
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track("dashboard_card_clicked", { label: cardLabel, href })}
    >
      {children}
    </Link>
  );
}
