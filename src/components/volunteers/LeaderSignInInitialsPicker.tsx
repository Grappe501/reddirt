"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { resolveLeaderResidence } from "@/lib/volunteers/resolve-leader-residence";
import type { VolunteerLeader } from "@/lib/volunteers/types";

type Props = {
  leaders: VolunteerLeader[];
};

export function LeaderSignInInitialsPicker({ leaders }: Props) {
  const sorted = useMemo(
    () => [...leaders].sort((a, b) => a.displayName.localeCompare(b.displayName, "en-US")),
    [leaders],
  );
  const [selectedSlug, setSelectedSlug] = useState("");

  const selected = sorted.find((l) => l.slug === selectedSlug) ?? null;
  const selectedInitials = selected?.initials ?? "";
  const geo = selected ? resolveLeaderResidence(selected) : null;

  return (
    <>
      <label className="block">
        <span className="ep-input-label">Pick your name</span>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="ep-input"
          aria-describedby="leader-code-hint"
        >
          <option value="">Select from roster…</option>
          {sorted.map((leader) => {
            const g = resolveLeaderResidence(leader);
            const place =
              g.cityLabel || g.countyName
                ? ` — ${[g.cityLabel, g.countyName ? `${g.countyName} Co.` : null].filter(Boolean).join(", ")}`
                : g.source === "missing"
                  ? " — location TBD"
                  : "";
            return (
              <option key={leader.slug} value={leader.slug}>
                {leader.displayName} ({leader.initials}){place}
              </option>
            );
          })}
        </select>
      </label>

      {selected ? (
        <p className="text-sm">
          <Link
            href={leaderWorkbenchHref(selected.slug)}
            className="font-semibold text-[var(--ep-blue)] hover:underline"
          >
            Open {selected.displayName}&apos;s dashboard →
          </Link>
          {geo && (geo.cityLabel || geo.countyName) ? (
            <span className="text-[var(--ep-navy-muted)]">
              {" "}
              · {[geo.cityLabel, geo.countyName ? `${geo.countyName} County` : null].filter(Boolean).join(", ")}
              {!geo.confirmed && geo.source === "inferred" ? " (inferred)" : ""}
            </span>
          ) : null}
        </p>
      ) : null}

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
          value={selectedInitials}
          onChange={(e) => {
            const code = e.target.value.toUpperCase();
            const match = sorted.find((l) => l.initials.toUpperCase() === code);
            setSelectedSlug(match?.slug ?? "");
          }}
          autoComplete="username"
        />
      </label>
      <p id="leader-code-hint" className="text-xs text-[var(--ep-navy-muted)]">
        {sorted.length} volunteers with dashboards — pick your name or enter your 3-letter code, then sign in to open
        your workbench.
      </p>
    </>
  );
}
