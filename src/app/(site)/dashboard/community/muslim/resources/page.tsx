import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";
import { MUSLIM_COMMUNITY_RESOURCE_STUBS } from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Muslim Community Region · Resources",
  description: "Lane resources and draft outlines — pending Muslim community leadership review.",
};

export default function MuslimCommunityResourcesPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Resource library</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Draft outlines below ship as full modules after partner review. Canonical long-form page with anchors:{" "}
          <Link href="/volunteer/resources/muslim-community#resources" className="font-semibold text-kelly-blue underline">
            Volunteer resource hub
          </Link>
          .
        </p>
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Youth Outreach materials</h3>
            <ul className="mt-3 space-y-3">
              {MUSLIM_COMMUNITY_RESOURCE_STUBS.filter((r) => r.lane === "youth").map((r) => (
                <li key={r.anchor} className="rounded-xl border border-kelly-text/10 bg-white p-4">
                  <p className="font-heading text-base font-bold text-kelly-navy">{r.title}</p>
                  <p className="mt-1 font-body text-xs font-semibold uppercase text-kelly-text/55">Draft · community review</p>
                  <p className="mt-2 font-body text-sm text-kelly-text/85">{r.blurb}</p>
                  <Link
                    href={`/volunteer/resources/muslim-community#${r.anchor}`}
                    className="mt-2 inline-block font-body text-sm font-semibold text-kelly-blue underline"
                  >
                    Open on hub →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-kelly-navy">Women&apos;s Outreach materials</h3>
            <ul className="mt-3 space-y-3">
              {MUSLIM_COMMUNITY_RESOURCE_STUBS.filter((r) => r.lane === "womens").map((r) => (
                <li key={r.anchor} className="rounded-xl border border-kelly-text/10 bg-white p-4">
                  <p className="font-heading text-base font-bold text-kelly-navy">{r.title}</p>
                  <p className="mt-1 font-body text-xs font-semibold uppercase text-kelly-text/55">Draft · community review</p>
                  <p className="mt-2 font-body text-sm text-kelly-text/85">{r.blurb}</p>
                  <Link
                    href={`/volunteer/resources/muslim-community#${r.anchor}`}
                    className="mt-2 inline-block font-body text-sm font-semibold text-kelly-blue underline"
                  >
                    Open on hub →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
