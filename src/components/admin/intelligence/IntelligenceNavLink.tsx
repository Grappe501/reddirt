"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  NAV_LINK_NEW_CHIP_CLASS,
  NAV_LINK_NEW_IPAD_CLASS,
  NAV_LINK_NEW_SIDEBAR_CLASS,
  useNavVisitHighlight,
} from "@/lib/intelligence/useNavVisitHighlight";

type IntelligenceNavLinkProps = ComponentProps<typeof Link> & {
  variant?: "chip" | "sidebar" | "ipad" | "plain";
  showNewBadge?: boolean;
};

export function IntelligenceNavLink({
  href,
  className = "",
  variant = "plain",
  showNewBadge = true,
  children,
  onClick,
  ...rest
}: IntelligenceNavLinkProps) {
  const { isNewUnvisited, markVisited } = useNavVisitHighlight();
  const hrefStr = typeof href === "string" ? href : (href.pathname ?? "");
  const isNew = isNewUnvisited(hrefStr);

  const newClass =
    isNew && variant === "chip"
      ? NAV_LINK_NEW_CHIP_CLASS
      : isNew && variant === "sidebar"
        ? NAV_LINK_NEW_SIDEBAR_CLASS
        : isNew && variant === "ipad"
          ? NAV_LINK_NEW_IPAD_CLASS
          : isNew
            ? NAV_LINK_NEW_CHIP_CLASS
            : "";

  return (
    <Link
      href={href}
      className={`${className} ${newClass}`.trim()}
      onClick={(event) => {
        markVisited(hrefStr);
        onClick?.(event);
      }}
      {...rest}
      aria-label={
        isNew && showNewBadge && typeof children === "string"
          ? `${children} (new)`
          : rest["aria-label"]
      }
    >
      {children}
      {isNew && showNewBadge && variant !== "sidebar" ? (
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-500 align-middle" aria-hidden />
      ) : null}
    </Link>
  );
}
