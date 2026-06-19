"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CandidateIpadDrillPlayerBottomNav } from "@/components/admin/intelligence/CandidateIpadDrillPlayerBottomNav";
import {
  resolveDrillQueueCardIndex,
  resolveDrillQueueIdClient,
} from "@/lib/intelligence/v4/phase16P3DrillQueueShared";

function IpadDrillPlayerBottomNavInner() {
  const searchParams = useSearchParams();
  const queueId = resolveDrillQueueIdClient(searchParams.get("queue") ?? undefined);
  const totalCards = Math.max(1, Number.parseInt(searchParams.get("total") ?? "6", 10) || 6);
  const cardIndex = resolveDrillQueueCardIndex(searchParams.get("card") ?? undefined, totalCards);
  const cardDurationMinutes = Math.max(1, Number.parseInt(searchParams.get("dur") ?? "5", 10) || 5);

  return (
    <CandidateIpadDrillPlayerBottomNav
      queueId={queueId}
      cardIndex={cardIndex}
      totalCards={totalCards}
      cardDurationMinutes={cardDurationMinutes}
    />
  );
}

export function CandidateIpadDrillPlayerBottomNavBridge() {
  return (
    <Suspense fallback={null}>
      <IpadDrillPlayerBottomNavInner />
    </Suspense>
  );
}
