import Link from "next/link";
import type { ComponentProps } from "react";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3 text-sm font-semibold tracking-wide transition duration-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-red-dirt text-cream-canvas shadow-soft hover:-translate-y-0.5 hover:bg-[#8f3d24] focus-visible:outline-red-dirt",
  secondary:
    "bg-washed-denim text-cream-canvas shadow-soft hover:-translate-y-0.5 hover:bg-[#4d5d6c] focus-visible:outline-washed-denim",
  outline:
    "border-2 border-deep-soil/25 bg-transparent text-deep-soil hover:border-deep-soil/50 hover:bg-deep-soil/[0.04] focus-visible:outline-deep-soil",
  ghost:
    "bg-transparent text-deep-soil underline-offset-4 hover:underline focus-visible:outline-red-dirt",
  /** For civic-midnight header / dark surfaces — avoids `text-deep-soil` on dark blue */
  ghostOnDark:
    "border-0 bg-transparent text-white underline-offset-4 hover:underline hover:text-sunlight-gold focus-visible:outline-civic-gold/60",
  outlineOnDark:
    "border-2 border-white/40 bg-civic-midnight text-white hover:border-white/60 hover:bg-civic-blue/50 focus-visible:outline-white",
  subtle:
    "bg-deep-soil/[0.06] text-deep-soil hover:bg-deep-soil/10 focus-visible:outline-red-dirt",
} as const;

export type ButtonVariant = keyof typeof variants;

type ButtonOwnProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    const ext = isExternalHref(href);
    return (
      <Link
        href={href}
        className={classes}
        {...linkRest}
        target={ext ? "_blank" : linkRest.target}
        rel={ext ? "noopener noreferrer" : linkRest.rel}
      >
        {children}
      </Link>
    );
  }

  const btn = rest as ComponentProps<"button">;
  const { type = "button", ...btnRest } = btn;
  return (
    <button type={type} className={classes} {...btnRest}>
      {children}
    </button>
  );
}
