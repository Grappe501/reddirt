import Link from "next/link";

export function VosResourceShortcuts({ teamSlug }: { teamSlug: string }) {
  const base = `/dashboard/team/${teamSlug}`;
  const links = [
    { href: "/volunteer/resources", label: "Volunteer resource library" },
    { href: "/volunteer/resources/glossary", label: "Glossary (new volunteers)" },
    { href: "/volunteer/resources/faq", label: "FAQ" },
    { href: "/field-playbook", label: "Field playbook (web)" },
    { href: "/field-playbook/roles/events-coordinator", label: "Events coordinator guide" },
    { href: "/field-playbook/roles/social-coordinator", label: "Social media coordinator guide" },
    { href: "/field-playbook/roles/power-of-five-coordinator", label: "Power of 5 / VR guide" },
    { href: "/volunteer/resources#team-building", label: "Team launch checklist" },
    { href: `${base}/training`, label: "Training path (this team)" },
    { href: "/volunteer", label: "Volunteer onboarding" },
  ];
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-6 md:p-8">
      <h3 className="font-heading text-lg font-bold text-kelly-navy">Resource shortcuts</h3>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-body text-sm font-medium text-kelly-blue underline hover:text-kelly-navy">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
