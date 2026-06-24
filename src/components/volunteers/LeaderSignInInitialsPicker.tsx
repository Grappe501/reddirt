"use client";

import { useMemo, useState } from "react";

import type { VolunteerLeader } from "@/lib/volunteers/types";

type Props = {
  leaders: VolunteerLeader[];
};

export function LeaderSignInInitialsPicker({ leaders }: Props) {
  const sorted = useMemo(
    () => [...leaders].sort((a, b) => a.displayName.localeCompare(b.displayName, "en-US")),
    [leaders],
  );
  const [selected, setSelected] = useState("");

  return (
    <>
      <label className="block">
        <span className="ep-input-label">Pick your name (optional)</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="ep-input"
          aria-describedby="leader-code-hint"
        >
          <option value="">Select from roster…</option>
          {sorted.map((leader) => (
            <option key={leader.slug} value={leader.initials}>
              {leader.displayName} ({leader.initials})
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="ep-input-label">Leader code</span>
        <input
          type="text"
          name="initials"
          id="leader-code"
          required
          minLength={3}
          maxLength={3}
          className="ep-input uppercase"
          value={selected}
          onChange={(e) => setSelected(e.target.value.toUpperCase())}
          autoComplete="username"
        />
      </label>
      <p id="leader-code-hint" className="text-xs text-[var(--ep-navy-muted)]">
        {sorted.length} leaders on roster — 3-letter code fills automatically when you pick your name.
      </p>
    </>
  );
}
