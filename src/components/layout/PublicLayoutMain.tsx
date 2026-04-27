import type { ReactNode } from "react";
import { SelfTeachingHintBanner } from "@/components/teaching/SelfTeachingHintBanner";

type Props = { children: ReactNode };

/**
 * Public marketing pages — content sits under `SiteHeader` + header shim in `(site)/layout`.
 * Fixed ambient orbs add depth without changing page composition (motion in tailwind, respects prefers-reduced-motion).
 */
export function PublicLayoutMain({ children }: Props) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -left-[20%] -top-[10%] h-[min(80vh,640px)] w-[min(120vw,900px)] rounded-full bg-kelly-gold/[0.11] blur-3xl max-sm:scale-110 max-sm:bg-kelly-gold/[0.16] motion-safe:animate-wow-drift dark:bg-kelly-gold/[0.07] dark:max-sm:bg-kelly-gold/[0.09]"
        />
        <div
          className="absolute -bottom-[5%] -right-[15%] h-[min(70vh,560px)] w-[min(100vw,720px)] rounded-full bg-kelly-navy/[0.09] blur-3xl max-sm:scale-105 max-sm:bg-kelly-navy/[0.12] motion-safe:animate-wow-drift motion-reduce:animate-none dark:bg-kelly-navy/[0.22] dark:max-sm:bg-kelly-navy/[0.18]"
          style={{ animationDelay: "-12s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 h-[40vh] w-[50vw] max-w-2xl rounded-full bg-kelly-blue/[0.06] blur-3xl max-sm:opacity-90 motion-safe:animate-wow-drift-slow dark:bg-kelly-blue/[0.12]"
          style={{ animationDelay: "-6s" }}
        />
      </div>
      <SelfTeachingHintBanner />
      {children}
    </div>
  );
}
