"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMS_APP_PATHS } from "@/lib/comms-workbench/comms-nav";

const links: { href: string; label: string; match: (path: string) => boolean }[] = [
  { href: COMMS_APP_PATHS.dashboard, label: "Dashboard", match: (p) => p === COMMS_APP_PATHS.dashboard },
  {
    href: COMMS_APP_PATHS.plans,
    label: "Message plans",
    match: (p) => p.startsWith(COMMS_APP_PATHS.plans),
  },
  {
    href: COMMS_APP_PATHS.media,
    label: "Media outreach",
    match: (p) => p.startsWith(COMMS_APP_PATHS.media),
  },
];

const base =
  "rounded border px-2 py-1 text-xs font-semibold transition sm:px-2.5 sm:py-1.5";
const activeCls = "border-civic-slate/40 bg-civic-slate/10 text-civic-slate";
const idleCls = "border-deep-soil/15 bg-white text-civic-slate hover:border-deep-soil/25";

export function CommsWorkbenchSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 border-b border-deep-soil/10 bg-cream-canvas/90 pb-2"
      aria-label="Comms workbench"
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`${base} ${l.match(pathname) ? activeCls : idleCls}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
