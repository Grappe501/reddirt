"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  slotKey: string;
  editing: boolean;
  className?: string;
  children: ReactNode;
};

/** Edit-mode chrome over public media slots — Change opens owned placements admin. */
export function SiteEditMediaChrome({ slotKey, editing, className, children }: Props) {
  if (!editing) return <>{children}</>;

  return (
    <span className={cn("relative block h-full w-full", className)}>
      {children}
      <Link
        href={`/admin/owned-media/public-placements?slot=${encodeURIComponent(slotKey)}`}
        className="absolute right-2 top-2 z-10 rounded border-2 border-[#000066] bg-[#000066] px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-white shadow"
      >
        Change media
      </Link>
      <span className="pointer-events-none absolute inset-0 rounded border-2 border-dashed border-[#ca913d]/70" />
    </span>
  );
}
