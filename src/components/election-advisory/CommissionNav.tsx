"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AEAC_BASE, aeacNavItems } from "@/content/election-advisory/catalog";

export function CommissionNav() {
  const pathname = usePathname();

  return (
    <nav className="aeac-nav" aria-label="Commission">
      {aeacNavItems.map((item) => {
        const active =
          item.href === AEAC_BASE
            ? pathname === AEAC_BASE
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} data-active={active ? "true" : "false"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
