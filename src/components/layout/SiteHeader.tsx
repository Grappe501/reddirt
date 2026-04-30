"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { primaryNavGroups, primaryNavMobileDrawerGroupOrder, voterRegistrationHref } from "@/config/navigation";
import type { NavGroup } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "@/components/search/SearchDialog";
import { HeaderRoundLogo } from "@/components/layout/HeaderRoundLogo";
import { NavDesktop } from "@/components/layout/NavDesktop";

function navItemActive(pathname: string, href: string) {
  return pathname === href || (href.length > 1 && pathname.startsWith(`${href}/`));
}

function navGroupsForMobileDrawer(): NavGroup[] {
  return primaryNavMobileDrawerGroupOrder
    .map((id) => primaryNavGroups.find((g) => g.id === id))
    .filter((g): g is NavGroup => g != null);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const panelId = useId();
  const joinCampaignHref = getJoinCampaignHref();
  const joinExternal = isExternalHref(joinCampaignHref);
  const headerRootRef = useRef<HTMLElement | null>(null);

  /** Sets `--site-header-h` (px) so `globals.css` can compute `--site-header-shim` for the layout shim. */
  useLayoutEffect(() => {
    const el = headerRootRef.current;
    if (!el) return;
    const apply = () => {
      // Extra px accounts for subpixel layout, box-shadow, and border stacks vs. a bare height read.
      const h = Math.ceil(el.getBoundingClientRect().height) + 10;
      document.documentElement.style.setProperty("--site-header-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--site-header-h");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setCompactHeader(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <header
      ref={headerRootRef}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full isolate border-b border-kelly-gold/25 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out",
        compactHeader
          ? "bg-kelly-navy/94 shadow-[0_6px_28px_rgba(0,0,102,0.42)] backdrop-blur-md backdrop-saturate-125"
          : "bg-kelly-navy shadow-[0_8px_32px_rgba(0,0,102,0.35)]",
      )}
    >
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="relative z-10 border-b border-kelly-gold/20">
        <div
          className={cn(
            "mx-auto flex w-full max-w-[100vw] items-center justify-between gap-2 px-[var(--gutter-x)] transition-[padding] duration-300 ease-out lg:gap-3",
            compactHeader ? "py-2 sm:py-2.5 lg:py-3" : "py-3 sm:py-3.5 lg:py-4",
          )}
        >
        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="group flex min-w-0 max-w-[min(100%,18rem)] shrink-0 items-center gap-2.5 sm:max-w-md sm:gap-3 lg:max-w-[20rem] xl:max-w-md 2xl:max-w-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-kelly-navy"
        >
          <span
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full border border-kelly-gold/25 bg-kelly-blue/40 shadow-[0_0_0_1px_rgba(201,162,39,0.12)_inset] transition-[width,height] duration-300 ease-out",
              compactHeader ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-12 sm:w-12",
            )}
          >
            <HeaderRoundLogo
              className="h-full w-full shrink-0 transition duration-200 group-hover:brightness-110"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex flex-col leading-tight text-white">
            <span className="font-heading text-sm font-bold tracking-tight transition group-hover:text-kelly-gold sm:text-base lg:text-lg">
            {siteConfig.name}
            </span>
            <span className="mt-0.5 hidden font-body text-[9px] font-medium uppercase tracking-[0.14em] text-white/90 sm:line-clamp-2 sm:text-[10px] lg:text-[11px]">
            {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-2 text-kelly-fog lg:flex lg:gap-3 xl:gap-2.5 2xl:gap-3"
          aria-label="Primary"
        >
          {/*
            Put dropdown nav before Search: the nav cluster is justify-end inside flex-1, so it grows left
            within the free column. If Search sits to the *left* of that column, the cluster overlaps the
            Search label. Order: [nav flex-1] [Search] [CTAs] so labels stay in separate flex tracks.
            Do not use overflow-x-auto on a parent of dropdowns — it can clip (position: absolute) menus.
          */}
          <div className="flex min-w-0 flex-1 min-h-0 items-center justify-end overflow-visible pr-0.5">
            <NavDesktop groups={primaryNavGroups} pathname={pathname} theme="dark" />
          </div>
          <Button
            type="button"
            variant="ghostOnDark"
            className="shrink-0 px-2 py-2 text-xs font-semibold tracking-wide xl:px-3"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            href={voterRegistrationHref}
            variant="outlineOnDark"
            title="Vote / Register"
            className="hidden min-h-11 min-w-0 flex-shrink-0 border-2 border-white/60 bg-white/12 px-2.5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md ring-1 ring-white/15 transition hover:border-white/75 hover:bg-white/18 lg:inline-flex lg:px-3.5 lg:text-sm"
            aria-label="Vote / Register — voter registration center"
          >
            <span className="xl:hidden">Vote</span>
            <span className="hidden xl:inline">Vote / Register</span>
          </Button>
          <Button
            href={joinCampaignHref}
            variant="outlineOnDark"
            className="ml-0.5 hidden min-h-11 flex-shrink-0 border-2 border-kelly-gold/55 bg-kelly-navy/45 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm ring-1 ring-kelly-gold/20 hover:border-kelly-gold/75 hover:bg-kelly-blue/35 lg:inline-flex lg:px-3.5 lg:text-sm"
            aria-label="Volunteer — sign up to help the campaign"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outlineOnDark"
            className="hidden min-h-11 min-w-0 flex-shrink-0 border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white/95 shadow-sm hover:border-kelly-gold/65 hover:bg-kelly-gold/16 lg:inline-flex lg:px-3.5 lg:text-sm"
            aria-label="Donate to the campaign"
          >
            Donate
          </Button>
        </nav>

        <div className="flex max-w-[min(100%,18rem)] flex-shrink-0 flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2 sm:justify-end text-kelly-fog lg:hidden">
          <Button
            href={voterRegistrationHref}
            variant="outlineOnDark"
            title="Vote / Register"
            className="order-first min-h-11 border-2 border-white/55 bg-white/12 px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white sm:px-3 sm:text-xs"
            aria-label="Vote / Register — voter registration center"
          >
            Vote
          </Button>
          <Button
            href={joinCampaignHref}
            target={joinExternal ? "_blank" : undefined}
            rel={joinExternal ? "noopener noreferrer" : undefined}
            variant="outlineOnDark"
            className="min-h-11 border border-kelly-gold/45 bg-kelly-navy/40 px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white sm:px-3.5 sm:text-xs"
            aria-label="Volunteer — sign up"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outlineOnDark"
            className="min-h-11 border border-kelly-gold/45 bg-kelly-gold/10 px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white sm:px-3.5 sm:text-xs"
            aria-label="Donate"
          >
            Donate
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="min-h-11 px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="min-h-11 px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </Button>
        </div>
        </div>
      </div>

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-0 z-40 bg-kelly-navy/70 transition duration-normal lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,420px)] border-l border-kelly-gold/20 bg-kelly-navy text-white shadow-2xl transition duration-normal lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        id={`${panelId}-drawer`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex h-full flex-col px-[var(--gutter-x)] py-6">
          <div className="flex items-center justify-between border-b border-kelly-gold/20 pb-4">
            <span className="font-heading text-lg font-bold text-white">Menu</span>
            <Button type="button" variant="ghostOnDark" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-6 overflow-y-auto pb-6" aria-label="Mobile primary">
            <div>
              <Link
                href={voterRegistrationHref}
                className="block min-h-[48px] rounded-btn bg-kelly-gold px-3 py-3 text-center font-body text-base font-bold text-kelly-navy shadow-md transition hover:bg-kelly-gold-soft focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/70"
                onClick={() => setOpen(false)}
              >
                Vote / Register
              </Link>
            </div>

            {navGroupsForMobileDrawer().map((group) => (
              <div key={group.id} className="border-t border-kelly-gold/15 pt-4">
                <p className="px-3 font-body text-[11px] font-bold tracking-wide text-white/85">{group.label}</p>
                <div className="mt-2 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = navItemActive(pathname, item.href);
                    const ext = isExternalHref(item.href);
                    return (
                      <Link
                        key={`${group.id}-${item.label}-${item.href}`}
                        href={item.href}
                        target={ext ? "_blank" : undefined}
                        rel={ext ? "noopener noreferrer" : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "min-h-[48px] rounded-btn px-3 py-3 font-body text-base font-medium",
                          active ? "bg-kelly-blue/60 text-kelly-gold" : "text-white hover:bg-kelly-blue/40",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-kelly-gold/20 pt-4 space-y-2">
              <Link
                href={joinCampaignHref}
                target={joinExternal ? "_blank" : undefined}
                rel={joinExternal ? "noopener noreferrer" : undefined}
                className="block min-h-[48px] rounded-btn border-2 border-kelly-gold/55 bg-kelly-navy/40 px-3 py-3 text-center font-body text-base font-bold text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/45"
                onClick={() => setOpen(false)}
              >
                Volunteer
              </Link>
              <Link
                href={siteConfig.donateHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-[48px] rounded-btn border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-3 text-center font-body text-base font-semibold text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/35"
                onClick={() => setOpen(false)}
              >
                Donate
              </Link>
              <Button
                type="button"
                variant="ghostOnDark"
                className="min-h-[48px] w-full justify-center rounded-btn border border-white/25 py-3 text-base font-semibold"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
              >
                Search
              </Button>
            </div>

            <Link
              href="/"
              className="mt-2 block rounded-btn px-3 py-3 text-center font-body text-base font-medium text-kelly-gold/95 hover:bg-kelly-blue/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/40"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
