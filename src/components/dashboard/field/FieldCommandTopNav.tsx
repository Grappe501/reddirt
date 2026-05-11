"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { fieldDirectorHref, fieldRegionsIndexHref } from "@/lib/field-structure/field-dashboard-paths";

const nav: { href: string; label: string; match: (p: string) => boolean }[] = [
  {
    href: fieldDirectorHref(),
    label: "Field Director",
    match: (p) => p === fieldDirectorHref() || p === `${fieldDirectorHref()}/`,
  },
  {
    href: `${fieldDirectorHref()}/leads/social-media`,
    label: "Lead · Social & media",
    match: (p) => p.startsWith(`${fieldDirectorHref()}/leads/social-media`),
  },
  {
    href: `${fieldDirectorHref()}/leads/power-of-5`,
    label: "Lead · Power of 5 / VR",
    match: (p) => p.startsWith(`${fieldDirectorHref()}/leads/power-of-5`),
  },
  {
    href: `${fieldDirectorHref()}/leads/events`,
    label: "Lead · Events",
    match: (p) => p.startsWith(`${fieldDirectorHref()}/leads/events`),
  },
  {
    href: fieldRegionsIndexHref(),
    label: "Regions",
    match: (p) => p.startsWith(fieldRegionsIndexHref()),
  },
];

export function FieldCommandTopNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Field command dashboards"
      className="-mb-px flex gap-1 overflow-x-auto border-t border-kelly-text/10 pt-4"
    >
      {nav.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-t-lg px-3 py-2 font-body text-xs font-semibold md:text-sm ${
              active
                ? "bg-kelly-page text-kelly-navy ring-1 ring-kelly-text/15"
                : "text-kelly-text/70 hover:bg-kelly-fog/80 hover:text-kelly-navy"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
