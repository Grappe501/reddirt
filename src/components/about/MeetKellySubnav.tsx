import Link from "next/link";
import { MEET_KELLY_SUBNAV } from "@/content/about/meet-kelly-hub";
import { cn } from "@/lib/utils";

type Props = {
  current?: string;
  className?: string;
};

export function MeetKellySubnav({ current, className }: Props) {
  if (MEET_KELLY_SUBNAV.length === 0) return null;
  return (
    <nav
      aria-label="Meet Kelly sections"
      className={cn(
        "flex flex-wrap gap-2 border-b border-kelly-text/10 pb-4",
        className,
      )}
    >
      {MEET_KELLY_SUBNAV.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 font-body text-sm font-semibold transition",
              active
                ? "bg-kelly-navy text-kelly-page"
                : "bg-kelly-text/[0.06] text-kelly-navy hover:bg-kelly-text/10",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
