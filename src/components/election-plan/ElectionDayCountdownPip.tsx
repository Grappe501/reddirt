"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";

import { ELECTION_DAY_2026 } from "@/lib/campaign-dates";

const TZ = "America/Chicago";
const ELECTION_INSTANT = fromZonedTime(`${ELECTION_DAY_2026}T00:00:00`, TZ);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type CountdownParts = {
  past: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeCountdown(now: Date): CountdownParts {
  const diff = ELECTION_INSTANT.getTime() - now.getTime();
  if (diff <= 0) {
    return { past: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    past: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function useCountdownTheme(): "dark" | "light" {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/election-plan/team-kickoff") && !pathname.includes("/presenter")) {
    return "dark";
  }
  return "light";
}

/**
 * Fixed upper-right Election Day 2026 countdown — Election Plan + CPOS kickoff surfaces.
 */
export function ElectionDayCountdownPip() {
  const theme = useCountdownTheme();
  const [parts, setParts] = useState<CountdownParts>(() => computeCountdown(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setParts(computeCountdown(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  const daysLabel = parts.past ? "Past" : parts.days === 0 ? "Today" : String(parts.days);
  const clockLabel = parts.past
    ? "Nov 3, 2026"
    : `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;

  const ariaLabel = parts.past
    ? "Election Day November 3, 2026 has passed"
    : `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes until Election Day November 3, 2026`;

  return (
    <div
      className={`ep-election-countdown-pip ep-election-countdown-pip--${theme}`}
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
    >
      <span className="ep-election-countdown-pip__label">Election Day 2026</span>
      <span className="ep-election-countdown-pip__days">{daysLabel}</span>
      {!parts.past && parts.days > 0 && <span className="ep-election-countdown-pip__unit">days</span>}
      <span className="ep-election-countdown-pip__clock">{clockLabel}</span>
    </div>
  );
}
