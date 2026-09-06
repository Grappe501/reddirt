"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ML_BASE } from "@/content/macroscopic-life/catalog";

const NAV = [
  { href: `${ML_BASE}/book`, label: "Book" },
  { href: `${ML_BASE}/figures`, label: "Figures" },
  { href: `${ML_BASE}/tests`, label: "Tests" },
  { href: `${ML_BASE}/models`, label: "Models" },
  { href: `${ML_BASE}/method`, label: "Method" },
  { href: `${ML_BASE}/listen`, label: "Listen" },
];

export function BookNav() {
  const pathname = usePathname();
  return (
    <nav className="ml-nav" aria-label="Book">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "true" : "false"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
