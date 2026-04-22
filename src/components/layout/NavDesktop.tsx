"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavGroup } from "@/config/navigation";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

function navItemActive(pathname: string, href: string) {
  return pathname === href || (href.length > 1 && pathname.startsWith(`${href}/`));
}

function groupActive(pathname: string, items: { href: string }[]) {
  return items.some((i) => navItemActive(pathname, i.href));
}

type NavTheme = "light" | "dark";

type NavMenuProps = {
  group: NavGroup;
  pathname: string;
  theme?: NavTheme;
};

function NavMenu({ group, pathname, theme = "light" }: NavMenuProps) {
  const dark = theme === "dark";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = groupActive(pathname, group.items);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const landing = group.groupLandingHref;
  const landingActive = landing ? navItemActive(pathname, landing) : false;
  const labelActive = active || landingActive;

  const labelClass = cn(
    "rounded-md px-2 py-2 font-body text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 xl:px-2.5 xl:text-sm",
    dark
      ? "focus-visible:ring-civic-gold/50 " +
          (labelActive ? "!text-sunlight-gold" : "!text-civic-fog hover:!text-sunlight-gold")
      : "focus-visible:ring-red-dirt/40 uppercase tracking-wider " +
          (labelActive ? "text-red-dirt" : "text-deep-soil/80 hover:text-red-dirt"),
  );

  return (
    <div className="relative flex-shrink-0" ref={rootRef}>
      {landing ? (
        <div className="flex items-stretch">
          <Link
            href={landing}
            className={cn(labelClass, "inline-flex items-center")}
            aria-current={landingActive ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {group.label}
          </Link>
          <button
            type="button"
            className={cn(
              "flex items-center rounded-r-md px-1.5 font-body text-[10px] opacity-90 transition focus-visible:outline-none focus-visible:ring-2 xl:px-2",
              dark
                ? "border-l border-white/15 !text-civic-fog hover:!text-sunlight-gold hover:bg-white/10 focus-visible:ring-civic-gold/50"
                : "border-l border-deep-soil/15 text-deep-soil hover:bg-deep-soil/[0.06] focus-visible:ring-red-dirt/40",
            )}
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls={menuId}
            aria-label={`${group.label} submenu`}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden>▾</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(labelClass, "flex items-center gap-1")}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {group.label}
          <span className="text-[10px] opacity-70" aria-hidden>
            ▾
          </span>
        </button>
      )}
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-1/2 top-full z-[60] mt-2 min-w-[13.5rem] max-w-[min(92vw,18rem)] -translate-x-1/2 rounded-card border border-deep-soil/12 bg-cream-canvas py-2 shadow-[var(--shadow-card)]"
        >
          {group.items.map((item) => {
            const itemActive = navItemActive(pathname, item.href);
            const ext = isExternalHref(item.href);
            return (
              <Link
                key={`${group.id}-${item.label}-${item.href}`}
                href={item.href}
                role="menuitem"
                aria-current={itemActive ? "page" : undefined}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
                className={cn(
                  "block px-4 py-2.5 font-body text-sm font-medium transition hover:bg-deep-soil/[0.05]",
                  itemActive ? "bg-red-dirt/10 text-red-dirt" : "text-deep-soil",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
                {ext ? <span className="sr-only"> (opens in new tab)</span> : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export type NavDesktopProps = {
  groups: NavGroup[];
  pathname: string;
  theme?: NavTheme;
};

export function NavDesktop({ groups, pathname, theme = "light" }: NavDesktopProps) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-x-1.5 xl:gap-x-2">
      {groups.map((g) => (
        <NavMenu key={g.id} group={g} pathname={pathname} theme={theme} />
      ))}
    </div>
  );
}
