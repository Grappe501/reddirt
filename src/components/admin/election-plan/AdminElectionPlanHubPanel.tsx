"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  AdminElectionPlanCatalog,
  AdminElectionPlanLink,
  AdminElectionPlanSection,
} from "@/lib/election-plan/admin-election-plan-catalog-types";

type Props = {
  catalog: AdminElectionPlanCatalog;
};

function isPortalHref(href: string): boolean {
  return href.startsWith("/election-plan");
}

function linkSearchBlob(link: AdminElectionPlanLink): string {
  return [link.label, link.href, ...(link.keywords ?? []), ...(link.related?.flatMap((r) => [r.label, r.href]) ?? [])]
    .join(" ")
    .toLowerCase();
}

function sectionMatches(section: AdminElectionPlanSection, term: string): AdminElectionPlanSection | null {
  if (!term) return section;
  const titleHit = section.title.toLowerCase().includes(term) || (section.description?.toLowerCase().includes(term) ?? false);
  const links = section.links.filter((l) => linkSearchBlob(l).includes(term));
  if (titleHit) return { ...section, links: term ? links.length ? links : section.links : section.links };
  if (links.length === 0) return null;
  return { ...section, links };
}

function variantBadge(variant: AdminElectionPlanLink["variant"]): string | null {
  if (variant === "event-workbench") return "Event workbench";
  if (variant === "city-workbench") return "City workbench";
  if (variant === "county-playbook") return "County playbook";
  return null;
}

function LinkRow({ link }: { link: AdminElectionPlanLink }) {
  const portal = isPortalHref(link.href);
  const badge = variantBadge(link.variant);
  return (
    <li
      className={`rounded-lg border px-3 py-2.5 ${
        link.variant === "event-workbench"
          ? "border-kelly-gold/40 bg-kelly-gold/10"
          : "border-kelly-text/10 bg-white/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {badge ? (
              <span className="rounded-full bg-kelly-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-kelly-inverse">
                {badge}
              </span>
            ) : null}
            <Link
              href={link.href}
              {...(portal ? { target: "_blank", rel: "noreferrer" } : {})}
              className="font-body text-sm font-semibold text-kelly-navy hover:underline"
            >
              {link.label}
              {portal ? <span className="ml-1 text-[10px] font-normal text-kelly-muted">↗ portal</span> : null}
            </Link>
          </div>
          {link.detail ? (
            <p className="mt-1 text-xs leading-relaxed text-kelly-muted">{link.detail}</p>
          ) : null}
        </div>
        <code className="max-w-full shrink-0 truncate rounded bg-kelly-text/5 px-1.5 py-0.5 font-mono text-[10px] text-kelly-muted">
          {link.href}
        </code>
      </div>
      {link.related && link.related.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {link.related.map((rel) => {
            const relPortal = isPortalHref(rel.href);
            return (
              <Link
                key={`${link.href}-${rel.href}`}
                href={rel.href}
                {...(relPortal ? { target: "_blank", rel: "noreferrer" } : {})}
                className="rounded-full border border-kelly-navy/15 bg-kelly-navy/5 px-2 py-0.5 text-[11px] font-medium text-kelly-navy hover:bg-kelly-navy/10"
              >
                {rel.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </li>
  );
}

export function AdminElectionPlanHubPanel({ catalog }: Props) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const term = q.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return catalog.sections
      .filter((s) => s.id !== "smoke-test")
      .map((s) => sectionMatches(s, term))
      .filter((s): s is AdminElectionPlanSection => s !== null);
  }, [catalog.sections, term]);

  const visibleLinkCount = useMemo(() => {
    return filteredSections.reduce((n, s) => n + s.links.length, 0);
  }, [filteredSections]);

  function toggleSection(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-kelly-gold">Election Plan OS</p>
      <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-text lg:text-3xl">Portal access hub</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-muted">
        Every election-plan workbench, county playbook, war room tab, and portal module — with cross-links intact.
        Portal routes open in a new tab (separate operator auth). Admin routes stay in this window.
      </p>

      {catalog.smokeTestLinks.length > 0 ? (
        <div className="mt-6 rounded-xl border-2 border-kelly-gold/35 bg-kelly-gold/5 p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-navy">
            Smoke test doorway
          </h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Primary paths for Steve — county, city pilots, Sherwood events anchor, and Grassroots &amp; Guitar Strings
            as an <strong className="font-semibold text-kelly-text">event workbench</strong> (not city leadership).
          </p>
          <ul className="mt-3 space-y-2">
            {catalog.smokeTestLinks.map((link) => (
              <LinkRow key={`smoke-${link.href}-${link.label}`} link={link} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total links", value: catalog.stats.totalLinks },
          { label: "Sections", value: catalog.stats.sectionCount },
          { label: "Workbenches", value: catalog.stats.workbenchCount },
          { label: "Counties", value: catalog.stats.countyCount },
          { label: "Cities", value: catalog.stats.cityCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-kelly-text/10 bg-white/70 px-4 py-3">
            <div className="font-heading text-xl font-bold text-kelly-navy">{stat.value}</div>
            <div className="text-xs text-kelly-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Search links</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workbenches, counties, tabs, academy roles…"
            className="w-full rounded-lg border border-kelly-text/15 bg-white px-4 py-2.5 text-sm text-kelly-text placeholder:text-kelly-muted focus:border-kelly-navy focus:outline-none focus:ring-1 focus:ring-kelly-navy/30"
          />
        </label>
        {term ? (
          <p className="text-sm text-kelly-muted">
            {visibleLinkCount} link{visibleLinkCount === 1 ? "" : "s"} in {filteredSections.length} section
            {filteredSections.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <div className="mt-8 space-y-4">
        {filteredSections.map((section) => {
          const isCollapsed = section.pinned ? false : (collapsed[section.id] ?? false);
          return (
            <section
              key={section.id}
              className="rounded-xl border border-kelly-text/10 bg-white/50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-kelly-navy/5"
              >
                <div>
                  <h2 className="font-heading text-base font-bold text-kelly-navy">{section.title}</h2>
                  {section.description ? (
                    <p className="mt-0.5 text-xs text-kelly-muted">{section.description}</p>
                  ) : null}
                </div>
                <span className="shrink-0 rounded-full bg-kelly-navy/10 px-2.5 py-0.5 text-xs font-semibold text-kelly-navy">
                  {section.links.length}
                </span>
              </button>
              {!isCollapsed ? (
                <ul className="space-y-2 border-t border-kelly-text/10 px-4 py-3">
                  {section.links.map((link) => (
                    <LinkRow key={`${section.id}-${link.href}-${link.label}`} link={link} />
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>

      {filteredSections.length === 0 ? (
        <p className="mt-8 text-sm text-kelly-muted">No links match &ldquo;{q}&rdquo;.</p>
      ) : null}

      <p className="mt-8 text-xs text-kelly-muted">
        Catalog generated {new Date(catalog.generatedAt).toLocaleString()}. Forward Motion and field calendar links
        populate when election-plan snapshot data is built.
      </p>
    </div>
  );
}
