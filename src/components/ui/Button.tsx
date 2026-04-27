import Link from "next/link";
import type { ComponentProps } from "react";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3 text-sm font-semibold tracking-wide transition duration-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-gradient-to-b from-kelly-gold to-[#b8872f] text-kelly-navy shadow-[0_6px_20px_rgba(202,145,61,0.45)] ring-1 ring-kelly-gold/40 ring-inset hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_28px_rgba(202,145,61,0.5)] focus-visible:outline-kelly-navy active:translate-y-0",
  secondary:
    "bg-kelly-navy text-kelly-white shadow-soft hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-kelly-gold",
  outline:
    "border-2 border-kelly-navy/25 bg-transparent text-kelly-text hover:border-kelly-navy/45 hover:bg-kelly-navy/[0.06] focus-visible:outline-kelly-navy",
  ghost:
    "bg-transparent text-kelly-text underline-offset-4 hover:underline focus-visible:outline-kelly-gold",
  /**
   * For kelly-navy header / dark surfaces.
   * Use `!` for color so we beat `body` / inherited `text-kelly-text` (buttons often inherit).
   */
  ghostOnDark:
    "border-0 bg-transparent !text-kelly-fog underline-offset-4 hover:underline hover:!text-kelly-gold focus-visible:outline-kelly-gold/60",
  outlineOnDark:
    "border-2 border-white/40 bg-kelly-navy/90 !text-kelly-fog hover:!text-white hover:border-white/60 hover:bg-kelly-blue/55 focus-visible:outline-white",
  subtle:
    "bg-kelly-text/[0.06] text-kelly-text hover:bg-kelly-navy/[0.08] focus-visible:outline-kelly-gold",
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
