"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getKellyDashboardHeroCandidates } from "@/lib/campaign-assets";
import { buildAskCampaignMailto } from "@/lib/campaign-links";

const TAGLINES = [
  "Trusted networks. Respectful outreach. Civic strength.",
  "Community-first organizing — statewide impact.",
  "Listen first. Register with care. Show up together.",
] as const;

function pickTagline(seed: string): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  const idx = (seed.length + day) % TAGLINES.length;
  return TAGLINES[idx] ?? TAGLINES[0];
}

/**
 * Compact super header for community region dashboards (Muslim, future Spanish / Marshallese).
 * Reuses Kelly hero chain from `campaign-assets` (e.g. `kelly-hero.png`).
 */
export function CommunityRegionHero({
  dashboardLabel,
  displayName,
  geography,
  dashboardBasePath,
  reviewBadge = "Community region",
}: {
  dashboardLabel: string;
  displayName: string;
  geography: string;
  dashboardBasePath: string;
  reviewBadge?: string;
}) {
  const heroCandidates = useMemo(() => getKellyDashboardHeroCandidates(), []);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imgSrc = heroCandidates[Math.min(candidateIndex, heroCandidates.length - 1)] ?? heroCandidates[0];
  const tagline = useMemo(() => pickTagline(displayName), [displayName]);
  const askMail = buildAskCampaignMailto(displayName, "community-region");

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
            Community dashboard
          </h1>
          <p className="mt-0.5 font-heading text-sm font-bold text-kelly-blue md:text-base">{dashboardLabel}</p>
          <p className="mt-1.5 font-body text-[13px] leading-snug text-kelly-text/88 md:text-sm">
            <span className="font-semibold text-kelly-deep">{displayName}</span>
            <span className="text-kelly-text/40"> · </span>
            <span>{geography}</span>
            <span className="text-kelly-text/40"> · </span>
            <span>Community region</span>
          </p>
          <p className="mt-2 font-body text-[11px] italic leading-snug text-kelly-deep/85 md:text-xs">&ldquo;{tagline}&rdquo;</p>

          <div className="mt-2 flex max-w-full flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-kelly-gold/40 bg-kelly-gold/15 px-2 py-0.5 font-body text-[10px] font-bold text-kelly-deep md:text-[11px]">
              {reviewBadge}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Link
              href="/field-playbook"
              className="inline-flex items-center justify-center rounded-md bg-kelly-navy px-2.5 py-1.5 font-body text-[11px] font-semibold text-white shadow-sm hover:bg-kelly-deep"
            >
              Field playbook
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Volunteer hub
            </Link>
            <Link
              href="/volunteer/resources/social-media-design"
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Canva / design
            </Link>
            <Link
              href={`${dashboardBasePath}/resources`}
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Region resources
            </Link>
            <a
              href={askMail}
              className="inline-flex items-center justify-center rounded-md border border-kelly-blue/30 bg-kelly-blue/[0.08] px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-blue/[0.14]"
            >
              Ask campaign
            </a>
            <Link
              href={`${dashboardBasePath}/rollup`}
              className="inline-flex items-center justify-center rounded-md border border-kelly-navy/25 bg-white/95 px-2.5 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
            >
              Rollup
            </Link>
          </div>
        </div>

        <div className="order-1 flex h-[120px] shrink-0 justify-center md:order-2 md:h-full md:max-h-[200px] md:items-end md:justify-end">
          <div className="relative h-full max-h-[200px] w-[min(100%,200px)] md:-mr-1 md:w-[190px]">
            <div
              className="absolute inset-0 overflow-hidden rounded-xl md:rounded-l-xl md:rounded-r-lg"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 88% 96% at 58% 40%, #000 22%, rgba(0,0,0,0.92) 68%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 88% 96% at 58% 40%, #000 22%, rgba(0,0,0,0.92) 68%, transparent 100%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- hero candidate chain */}
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
