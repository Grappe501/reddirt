"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CandidateIpadDrillPlayerBottomNav } from "@/components/admin/intelligence/CandidateIpadDrillPlayerBottomNav";
import {
  getDrillQueueCards,
  resolveDrillQueueCardIndex,
  resolveDrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";

function IpadDrillPlayerBottomNavInner() {
  const searchParams = useSearchParams();
  const queueId = resolveDrillQueueId(searchParams.get("queue") ?? undefined);
  const cards = getDrillQueueCards(queueId);
  if (cards.length === 0) return null;
  const cardIndex = resolveDrillQueueCardIndex(searchParams.get("card") ?? undefined, cards.length);
  const card = cards[cardIndex]!;

  return (
    <CandidateIpadDrillPlayerBottomNav
      queueId={queueId}
      cardIndex={cardIndex}
      totalCards={cards.length}
      cardDurationMinutes={card.durationMinutes}
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
