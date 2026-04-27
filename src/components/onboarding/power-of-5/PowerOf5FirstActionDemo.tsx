"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const MAX = 5;

type Props = {
  /** Controlled mode: parent wizard keeps progress when changing steps. */
  count?: number;
  onAdd?: () => void;
  onReset?: () => void;
};

/**
 * Local or controlled state — no API, no persistence, no contact fields.
 */
export function PowerOf5FirstActionDemo(props: Props) {
  const { count: countProp, onAdd, onReset } = props ?? {};
  const [internalCount, setInternalCount] = useState(0);
  const controlled = countProp !== undefined && onAdd !== undefined && onReset !== undefined;
  const count = controlled ? countProp : internalCount;

  const addOne = () => {
    if (controlled) onAdd();
    else setInternalCount((c) => Math.min(MAX, c + 1));
  };
  const reset = () => {
    if (controlled) onReset();
    else setInternalCount(0);
  };

  const pct = Math.round((count / MAX) * 100);

  return (
    <div className="rounded-2xl border-2 border-dashed border-kelly-navy/20 bg-white/90 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-bold text-kelly-navy">First action simulation</p>
          <p className="mt-1 text-xs text-kelly-text/65">In-browser only. Nothing is saved or submitted.</p>
        </div>
        <span className="rounded-full bg-kelly-gold/20 px-3 py-1 text-xs font-bold text-kelly-navy">
          {count}/{MAX}
        </span>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-kelly-text/10"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-label="Power team progress"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-kelly-gold to-kelly-navy/70 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 font-body text-sm font-semibold text-kelly-text">
        Your Power Team is {pct}% started.
      </p>
      <p className="mt-1 text-sm text-kelly-text/75">
        {count === 0
          ? "Tap below to simulate adding your first person — in production this would follow consent flows and real invites."
          : count < MAX
            ? "You just added another organizing node in this demo. In real life, that is a relationship you tend — not just a row in a sheet."
            : "Demo complete: five slots filled. In the live product, completion unlocks team milestones and geography badges — still aggregate-first."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={addOne} disabled={count >= MAX}>
          {count === 0 ? "Add first person" : count < MAX ? "Add another (demo)" : "Five filled (demo)"}
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset demo
        </Button>
      </div>
    </div>
  );
}
