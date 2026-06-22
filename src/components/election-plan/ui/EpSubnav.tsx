"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type EpSubnavTab = {
  href: string;
  label: string;
  exact?: boolean;
};

type Props = {
  tabs: readonly EpSubnavTab[];
  activePath: string;
  ariaLabel: string;
  className?: string;
};

export function EpSubnav({ tabs, activePath, ariaLabel, className }: Props) {
  return (
    <nav className={cn("ep-subnav", className)} aria-label={ariaLabel}>
      <div className="ep-subnav-track">
        {tabs.map((tab) => {
          const active =
            tab.exact === true
              ? activePath === tab.href
              : activePath === tab.href || activePath.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn("ep-subnav-tab", active && "ep-subnav-tab-active")}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
