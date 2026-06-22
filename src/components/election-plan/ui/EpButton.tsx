import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "ep-btn ep-btn-primary",
  secondary: "ep-btn ep-btn-secondary",
  ghost: "ep-btn ep-btn-ghost",
  success: "ep-btn ep-btn-success",
  danger: "ep-btn ep-btn-danger",
};

const sizeClass: Record<Size, string> = {
  sm: "ep-btn-sm",
  md: "",
  lg: "ep-btn-lg",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

type ButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: never };

type LinkProps = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps | "href"> & { href: string };

export function EpButton(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children, fullWidth, ...rest } = props;
  const classes = cn(variantClass[variant], sizeClass[size], fullWidth && "ep-btn-block", className);

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as Omit<LinkProps, keyof BaseProps>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonProps, keyof BaseProps>;
  return (
    <button type={buttonRest.type ?? "button"} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
