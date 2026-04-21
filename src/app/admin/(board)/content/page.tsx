import Link from "next/link";

export default function AdminContentOverviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Content overview</h1>
      <p className="mt-3 font-body text-deep-soil/75">
        Use the sections in the left rail for concrete tasks. This page is a quick orientation.
      </p>
      <ul className="mt-8 space-y-4 font-body text-deep-soil/85">
        <li>
          <Link href="/admin/orchestrator" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Content orchestrator
          </Link>{" "}
          — inbound inbox, platform sync, distribution to <code className="text-xs">/updates</code> and homepage rail.
        </li>
        <li>
          <Link href="/admin/homepage" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Homepage
          </Link>{" "}
          — hero lines, section visibility/order, quote band, final CTA, featured story & blog slugs.
        </li>
        <li>
          <Link href="/admin/pages" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Page copy
          </Link>{" "}
          — hero overrides for major public pages (beliefs, movement, pillars, resources).
        </li>
        <li>
          <Link href="/admin/stories" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Stories / editorial / explainers
          </Link>{" "}
          — hide, feature, teaser, and hero image overrides atop static TypeScript content.
        </li>
        <li>
          <Link href="/admin/media" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Media
          </Link>{" "}
          — URL-first library with alt text, captions, and usage tags.
        </li>
        <li>
          <Link href="/admin/blog" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Blog sync
          </Link>{" "}
          — Substack via RSS; no write-back to Substack.
        </li>
      </ul>
    </div>
  );
}
