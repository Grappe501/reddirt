"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { primaryNavGroups } from "@/config/navigation";
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

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
      className="fixed left-0 right-0 top-0 z-50 w-full isolate border-b border-civic-gold/20 bg-civic-midnight shadow-[0_8px_32px_rgba(12,18,34,0.25)]"
    >
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="relative z-10 border-b border-civic-gold/20 bg-civic-midnight">
        <div className="mx-auto flex w-full max-w-[100vw] items-center justify-between gap-2 px-[var(--gutter-x)] py-3 sm:py-3.5 lg:gap-3 lg:py-4">
        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="group flex min-w-0 max-w-[min(100%,18rem)] shrink-0 items-center gap-2.5 sm:max-w-md sm:gap-3 lg:max-w-[20rem] xl:max-w-md 2xl:max-w-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-civic-midnight"
        >
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-civic-gold/25 bg-civic-blue/40 shadow-[0_0_0_1px_rgba(201,162,39,0.12)_inset] sm:h-12 sm:w-12">
            <HeaderRoundLogo
              className="h-full w-full shrink-0 transition duration-200 group-hover:brightness-110"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex flex-col leading-tight text-white">
            <span className="font-heading text-sm font-bold tracking-tight transition group-hover:text-sunlight-gold sm:text-base lg:text-lg">
            {siteConfig.name}
            </span>
            <span className="mt-0.5 hidden font-body text-[9px] font-medium uppercase tracking-[0.14em] text-white/90 sm:line-clamp-2 sm:text-[10px] lg:text-[11px]">
            {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-2 text-civic-fog lg:flex lg:gap-3 xl:gap-2.5 2xl:gap-3"
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
            href={joinCampaignHref}
            variant="primary"
            className="ml-1 hidden min-h-11 flex-shrink-0 border border-red-dirt/20 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wide shadow-md ring-1 ring-white/10 hover:ring-white/20 lg:inline-flex lg:px-4 lg:text-sm"
            aria-label="Volunteer — sign up to help the campaign"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outlineOnDark"
            className="hidden min-h-11 min-w-0 flex-shrink-0 border-2 border-sunlight-gold/90 bg-sunlight-gold/20 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md hover:border-sunlight-gold hover:bg-sunlight-gold/30 lg:inline-flex lg:px-4 lg:text-sm"
            aria-label="Donate to the campaign"
          >
            Donate
          </Button>
        </nav>

        <div className="flex max-w-[min(100%,18rem)] flex-shrink-0 flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2 sm:justify-end text-civic-fog lg:hidden">
          <Button
            href={joinCampaignHref}
            target={joinExternal ? "_blank" : undefined}
            rel={joinExternal ? "noopener noreferrer" : undefined}
            variant="primary"
            className="px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide shadow-md sm:px-3.5 sm:text-xs"
            aria-label="Volunteer — sign up"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outlineOnDark"
            className="border-2 border-sunlight-gold/90 bg-sunlight-gold/15 px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white sm:px-3.5 sm:text-xs"
            aria-label="Donate"
          >
            Donate
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
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
          "fixed inset-0 z-40 bg-civic-midnight/70 transition duration-normal lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,420px)] border-l border-civic-gold/20 bg-civic-midnight text-white shadow-2xl transition duration-normal lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        id={`${panelId}-drawer`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex h-full flex-col px-[var(--gutter-x)] py-6">
          <div className="flex items-center justify-between border-b border-civic-gold/20 pb-4">
            <span className="font-heading text-lg font-bold text-white">Menu</span>
            <Button type="button" variant="ghostOnDark" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile primary">
            {primaryNavGroups.map((group) => (
              <div key={group.id} className="pt-4 first:pt-2">
                <p className="px-3 font-body text-[11px] font-bold tracking-wide text-white/85">
                  {group.label}
                </p>
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
                          "rounded-btn px-3 py-3 font-body text-base font-medium",
                          active
                            ? "bg-civic-blue/60 text-sunlight-gold"
                            : "text-white hover:bg-civic-blue/40",
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
            <Link
              href={joinCampaignHref}
              target={joinExternal ? "_blank" : undefined}
              rel={joinExternal ? "noopener noreferrer" : undefined}
              className="mt-6 rounded-btn bg-red-dirt px-3 py-3 text-center font-body text-base font-bold text-cream-canvas"
              onClick={() => setOpen(false)}
            >
              Volunteer sign-up
            </Link>
            <Link
              href={siteConfig.donateHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-btn border-2 border-sunlight-gold/70 bg-sunlight-gold/10 px-3 py-3 text-center font-body text-base font-bold text-white"
              onClick={() => setOpen(false)}
            >
              Donate
            </Link>
            <Link
              href="/get-involved"
              className="rounded-btn border border-white/35 px-3 py-3 text-center font-body text-base font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Command HQ · this site
            </Link>
            <Link
              href="/"
              className="rounded-btn px-3 py-3 font-body text-base font-medium text-sunlight-gold/95 hover:bg-civic-blue/30"
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
