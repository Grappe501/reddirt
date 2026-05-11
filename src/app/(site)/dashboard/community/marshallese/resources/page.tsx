import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Marshallese · Resources",
  description: "Scaffold — region resource lane pending partner content packs.",
};

export default function MarshalleseResourcesPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
      <p className="font-heading text-lg font-bold text-kelly-navy">Resources (scaffold)</p>
      <p className="font-body text-sm text-kelly-text/85">
        Marshallese-community-shaped toolkits and lane guides will publish here after Ernie review and leadership alignment.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
          Volunteer resource library
        </Link>
      </p>
    </div>
  );
}
