"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import {
  buildIpadDrillPlayerHref,
  IPAD_DRILL_PLAYER_HREF,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import type { DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export function CandidateIpadDrillPlayerBottomNav({
  queueId,
  cardIndex,
  totalCards,
  cardDurationMinutes,
}: {
  queueId: DrillQueueId;
  cardIndex: number;
  totalCards: number;
  cardDurationMinutes: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(cardDurationMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(cardDurationMinutes * 60);
    setTimerRunning(false);
  }, [cardDurationMinutes, cardIndex, queueId]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const prevCard = cardIndex > 0 ? cardIndex : null;
  const nextCard = cardIndex < totalCards - 1 ? cardIndex + 2 : null;

  function navigate(cardNumber: number) {
    router.push(buildIpadDrillPlayerHref(queueId, cardNumber));
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const touchClass = "min-h-12 min-w-12";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[820px] border-t border-teal-300 bg-white/98 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="iPad drill player controls"
      data-phase16-p5="bottom-nav"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        <Link
          href={CANDIDATE_COMMAND_HOME_HREF}
          className={`flex ${touchClass} flex-col items-center justify-center rounded-xl border border-kelly-text/15 bg-kelly-surface/30 text-[11px] font-bold text-kelly-navy active:bg-kelly-surface`}
        >
          Exit
        </Link>
        <button
          type="button"
          disabled={prevCard === null}
          onClick={() => prevCard !== null && navigate(prevCard)}
          className={`flex ${touchClass} flex-col items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-[11px] font-bold text-teal-950 disabled:opacity-40 active:bg-teal-100`}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={nextCard === null}
          onClick={() => nextCard !== null && navigate(nextCard)}
          className={`flex ${touchClass} flex-col items-center justify-center rounded-xl border border-teal-500 bg-teal-600 text-[11px] font-bold text-white disabled:opacity-40 active:bg-teal-700`}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => setTimerRunning((r) => !r)}
          className={`flex ${touchClass} flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-50 font-mono text-[11px] font-bold text-amber-950 active:bg-amber-100`}
          aria-label={timerRunning ? "Pause timer" : "Start timer"}
        >
          {mm}:{ss}
        </button>
      </div>
      <p className="pb-1 text-center font-mono text-[9px] text-kelly-subtle">
        Card {cardIndex + 1}/{totalCards} · {IPAD_DRILL_PLAYER_HREF.replace("/admin/intelligence", "")}
        {searchParams.get("queue") ? ` · ${searchParams.get("queue")}` : ""}
      </p>
    </nav>
  );
}
