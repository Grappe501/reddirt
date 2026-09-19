"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AeacNavItem } from "@/content/election-advisory/catalog";
import { normalizeAeacPathname } from "@/lib/election-advisory/public-origin";

export function CommissionNav({ items }: { items: AeacNavItem[] }) {
  const pathname = normalizeAeacPathname(usePathname());

  return (
    <nav className="aeac-nav" aria-label="Commission">
      {items.map((item) => {
        const itemPath = normalizeAeacPathname(item.href);
        const active =
          itemPath === "/"
            ? pathname === "/"
            : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
        return (
          <Link key={item.href} href={item.href} data-active={active ? "true" : "false"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
