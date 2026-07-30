"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  disableSiteEditModeAction,
  enableSiteEditModeAction,
} from "@/app/admin/site-edit-actions";
import { PUBLIC_EDIT_PAGE_LINKS } from "@/lib/site-edit/public-edit-pages";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  canEdit: boolean;
};

/**
 * Public-site edit mode chrome — enter via /edit, browse any public page, exit here.
 * Basic: copy + media slot change. Website workbench later.
 */
export function SiteEditChrome({ active, canEdit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [showPages, setShowPages] = useState(true);
  const [pending, start] = useTransition();

  if (!canEdit && !active) return null;

  function enable() {
    start(async () => {
      const res = await enableSiteEditModeAction();
      setMessage(res.message);
      if (res.ok) {
        router.refresh();
        router.push("/edit");
      }
    });
  }

  function disable() {
    start(async () => {
      const res = await disableSiteEditModeAction();
      setMessage(res.message);
      if (res.ok) {
        router.refresh();
        router.push("/");
      }
    });
  }

  if (!active) {
    return (
      <div className="fixed bottom-4 right-4 z-[90] max-w-sm rounded-lg border-2 border-[#000066] bg-white p-3 shadow-lg">
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Website edit</p>
        <p className="mt-1 font-body text-[11px] text-[#364272]">
          Open the public site in edit mode — change copy, swap images/video on media slots. More
          tools come in the website workbench later.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={enable}
          className="mt-2 rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Enter edit mode
        </button>
        {message ? <p className="mt-1 font-body text-[10px] text-[#364272]">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-[90] border-b-2 border-[#ca913d] bg-[#fff8ef] text-[#12124a]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Website · edit mode
          </p>
          <p className="font-body text-[10px] text-[#364272]">
            Browse any public page below. Click outlined copy to edit. Media slots show Change media.
            Prefer Unknown — no invented claims.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/edit"
            className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
          >
            Edit hub
          </Link>
          <Link
            href="/admin/owned-media/public-placements"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
          >
            Media placements
          </Link>
          <Link
            href="/admin/pages"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
          >
            Page heroes
          </Link>
          <button
            type="button"
            onClick={() => setShowPages((v) => !v)}
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
          >
            {showPages ? "Hide pages" : "Show pages"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={disable}
            className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
          >
            Exit edit mode
          </button>
        </div>
      </div>
      {showPages ? (
        <div className="border-t border-[#ca913d]/40 px-4 py-2">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-1.5">
            {PUBLIC_EDIT_PAGE_LINKS.map((p) => {
              const on =
                p.href === "/"
                  ? pathname === "/"
                  : pathname === p.href || pathname.startsWith(`${p.href}/`);
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  title={p.hint}
                  className={cn(
                    "rounded border px-2 py-1 font-body text-[10px] font-semibold",
                    on
                      ? "border-[#000066] bg-[#000066] text-white"
                      : "border-[#8eb6dc] bg-white text-[#12124a]",
                  )}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      {message ? (
        <p className="border-t border-[#ca913d]/40 px-4 py-1 font-body text-[10px] text-[#364272]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
