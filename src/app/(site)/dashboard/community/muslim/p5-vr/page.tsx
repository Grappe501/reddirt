import type { Metadata } from "next";
import Link from "next/link";

import { MuslimCommunityReviewBanner } from "@/components/dashboard/community/MuslimCommunityReviewBanner";

export const metadata: Metadata = {
  title: "Muslim Community Region · P5 / Voter Registration",
  description: "Relational contacts, registration assistance, and turnout education for the Muslim Community Region.",
};

export default function MuslimCommunityP5VrPage() {
  return (
    <div className="space-y-6">
      <MuslimCommunityReviewBanner />
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">P5 / Voter Registration</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Relational contacts, registration assistance, and turnout education — coordinated with the campaign Power of 5 /
          voter registration lead. Youth and Women&apos;s lanes feed shared registration goals; escalation runs through the Muslim
          Community Overall Lead and Field Director when policy or sensitive community dynamics need staff support.
        </p>
        <p className="mt-4 font-body text-sm text-kelly-text/85">
          Field discipline and doctrine live in the{" "}
          <Link href="/field-playbook" className="font-semibold text-kelly-blue underline">
            field playbook
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
