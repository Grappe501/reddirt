"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getKellyDashboardHeroCandidates } from "@/lib/campaign-assets";
import { buildAskCampaignMailto } from "@/lib/campaign-links";
import { deriveTeamLifecycleStatus } from "@/lib/dashboard/invitation-privacy";
import type { GotvReadinessBand, Team, TeamLevel } from "@/types/dashboard";

function formatLevel(level: TeamLevel): string {
  return level.slice(0, 1).toUpperCase() + level.slice(1);
}

function hasCoreTriad(members: Team["members"]): boolean {
  const s = new Set(members.map((m) => m.role));
  return s.has("events") && s.has("social-media") && s.has("power-of-5");
}

function gotvRibbonClass(band: GotvReadinessBand): string {
  switch (band) {
    case "not-started":
      return "bg-kelly-text/15 text-kelly-deep";
    case "building":
      return "bg-kelly-gold/35 text-kelly-deep";
    case "on-track":
      return "bg-kelly-blue/20 text-kelly-navy";
    case "gotv-ready":
      return "bg-kelly-success/35 text-kelly-deep";
    default:
      return "bg-kelly-fog text-kelly-deep";
  }
}

const HERO_TAGLINES = [
  "Small actions. Local teams. Statewide impact.",
  "More teams, not bigger teams.",
  "Build the next team.",
  "Train as you grow.",
  "Get GOTV ready.",
  "Every local action moves Arkansas forward.",
] as const;

function pickTagline(teamId: string): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  const idx = (teamId.length + day) % HERO_TAGLINES.length;
  return HERO_TAGLINES[idx] ?? HERO_TAGLINES[0];
}

export function TeamDashboardHero({
  team,
  teamSlug,
  dashboardLabel,
  viewerUserId,
}: {
  team: Team;
  teamSlug: string;
  dashboardLabel: string;
  viewerUserId?: string | null;
}) {
  const base = `/dashboard/team/${teamSlug}`;
  const heroCandidates = useMemo(() => getKellyDashboardHeroCandidates(), []);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imgSrc = heroCandidates[Math.min(candidateIndex, heroCandidates.length - 1)] ?? heroCandidates[0];

  const lifecycle =
    team.lifecycleStatus ??
    deriveTeamLifecycleStatus({
      memberCount: team.members.length,
      hasCoreTriad: hasCoreTriad(team.members),
      downstreamLaunched: team.downstreamTeamIds.length,
    });

  const gotv = team.fieldOperatingSystem?.gotvReadiness;
  const tagline = useMemo(() => pickTagline(team.id), [team.id]);
  const askMail = buildAskCampaignMailto(team.displayName, teamSlug);

  const bumpImage = () => {
    setCandidateIndex((i) => Math.min(i + 1, heroCandidates.length - 1));
  };

  return (
    <div className="relative max-h-[240px] overflow-hidden rounded-2xl border border-kelly-navy/12 bg-gradient-to-br from-kelly-navy/[0.06] via-white to-kelly-gold/[0.12] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]">
      <div className="grid max-h-[240px] grid-cols-1 items-stretch gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(120px,190px)] md:gap-4 md:p-5">
        <div className="order-2 flex min-h-0 min-w-0 flex-col justify-center md:order-1">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/55 md:text-[11px]">
            Kelly Grappe for Secretary of State
          </p>
          <h1 className="mt-1 font-heading text-xl font-extrabold leading-snug tracking-tight text-kelly-navy md:text-2xl lg:text-[1.65rem]">
            Volunteer Dashboard
          </h1>
          <p className="mt-0.5 font-heading text-sm font-bold text-kelly-blue md:text-base">{dashboardLabel}</p>
          <p className="mt-1.5 font-body text-[13px] leading-snug text-kelly-text/88 md:text-sm">
            <span className="font-semibold text-kelly-deep">{team.displayName}</span>
            <span className="text-kelly-text/40"> · </span>
            <span>{team.geography}</span>
            <span className="text-kelly-text/40"> · </span>
            <span>{formatLevel(team.level)}</span>
            {viewerUserId ? (
              <>
                <span className="text-kelly-text/40"> · </span>
                <span className="font-medium text-kelly-success">Session active</span>
              </>
            ) : null}
          </p>

          <p className="mt-2 font-body text-[11px] italic leading-snug text-kelly-deep/85 md:text-xs">&ldquo;{tagline}&rdquo;</p>

          <div className="mt-2 flex max-w-full flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-kelly-navy/15 bg-white/90 px-2 py-0.5 font-body text-[10px] font-bold text-kelly-navy md:text-[11px]">
              Status · {lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1)}
            </span>
            <span className="rounded-md bg-white/90 px-2 py-0.5 font-body text-[10px] font-semibold text-kelly-deep ring-1 ring-kelly-text/10 md:text-[11px]">
              {team.teamCode}
            </span>
            {gotv ? (
              <span
                className={`rounded-md px-2 py-0.5 font-body text-[10px] font-bold md:text-[11px] ${gotvRibbonClass(gotv.band)}`}
              >
                GOTV · {gotv.bandLabel} ({gotv.compositeScore}%)
              </span>
            ) : (
              <span className="rounded-md bg-kelly-fog px-2 py-0.5 font-body text-[10px] font-semibold text-kelly-text/70 md:text-[11px]">
                GOTV · see Overview
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Link
              href={`${base}/training#training-module-start-here`}
              className="inline-flex items-center justify-center rounded-md bg-kelly-navy px-2.5 py-1.5 font-body text-[11px] font-semibold text-white shadow-sm hover:bg-kelly-deep"
            >
              Today&apos;s task
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Invite teammate
            </Link>
            <Link
              href={`${base}/resources`}
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Open resources
            </Link>
            <a
              href={askMail}
              className="inline-flex items-center justify-center rounded-md border border-kelly-blue/30 bg-kelly-blue/[0.08] px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-blue/[0.14]"
            >
              Ask campaign
            </a>
            <Link
              href={`${base}/metrics`}
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              View metrics
            </Link>
          </div>
        </div>

        <div className="order-1 flex h-[120px] shrink-0 justify-center md:order-2 md:h-full md:max-h-[200px] md:items-end md:justify-end">
          <div className="relative h-full max-h-[200px] w-[min(100%,200px)] md:-mr-1 md:w-[190px]">
            {/* Feather / isolate: radial mask softens cutout edges on the campaign gradient */}
            <div
              className="absolute inset-0 overflow-hidden rounded-xl md:rounded-l-xl md:rounded-r-lg"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 88% 96% at 58% 40%, #000 22%, rgba(0,0,0,0.92) 68%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 88% 96% at 58% 40%, #000 22%, rgba(0,0,0,0.92) 68%, transparent 100%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- cutout + candidate chain; Next Image not ideal for mask */}
              <img
                src={imgSrc}
                alt="Kelly Grappe"
                width={190}
                height={220}
                className="h-full w-full scale-[1.02] object-cover object-[56%_12%] drop-shadow-[0_10px_24px_rgba(15,30,60,0.18)]"
                onError={bumpImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
