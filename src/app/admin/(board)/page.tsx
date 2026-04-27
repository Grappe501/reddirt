import Link from "next/link";

const cards = [
  { href: "/admin/homepage", title: "Homepage", body: "Hero, sections, quotes, featured rails." },
  { href: "/admin/pages", title: "Page copy", body: "Hero text for belief, movement, and pillar pages." },
  { href: "/admin/blog", title: "Blog / Substack", body: "Sync RSS, feature posts, teasers, placement." },
  { href: "/admin/media", title: "Media library", body: "Register imagery and embeds with metadata." },
  { href: "/admin/settings", title: "Settings", body: "Feed URL, sync status, integration notes." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Website content board</h1>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/75">
        You’re in the public-site control room: copy, homepage composition, syndicated writing, and media
        metadata. Organizer dashboards and field data stay in the other system.
      </p>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-kelly-navy/25"
            >
              <h2 className="font-heading text-lg font-bold text-kelly-text">{c.title}</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">{c.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
