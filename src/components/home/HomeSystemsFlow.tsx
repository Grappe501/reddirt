"use client";

import { Fragment, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = ["Recruit", "Train", "Manage", "Sustain"] as const;

/**
 * Visual systems rhythm tied to large-scale operations experience.
 * TODO: optional progressive connector accent when motion budget allows.
 */
export function HomeSystemsFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const reduceMotion = useReducedMotion();

  const stagger = reduceMotion ? 0 : 0.17;

  return (
    <div ref={ref} className="mx-auto mt-10 max-w-4xl px-1">
      <p className="text-center font-body text-sm leading-relaxed text-white/72 md:text-base">
        The same rhythm large organizations use to stay functional—clear roles, trained people, and systems that keep working
        after the meeting ends.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-center md:gap-y-5">
        {STEPS.map((label, i) => (
          <Fragment key={label}>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: reduceMotion ? 0 : 0.42,
                delay: reduceMotion ? 0 : i * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className={cn(
                  "rounded-card border border-white/20 bg-kelly-blue/35 px-5 py-3.5 text-center shadow-sm backdrop-blur-sm",
                  "min-w-[10rem] transition-[border-color,box-shadow] duration-300 ease-out hover:border-kelly-gold/40 hover:shadow-md md:min-w-[6.75rem]",
                )}
              >
                <span className="font-heading text-sm font-bold text-white">{label}</span>
              </div>
            </motion.div>
            {i < STEPS.length - 1 ? (
              <div
                className="hidden h-1 w-10 shrink-0 rounded-full bg-kelly-gold/35 md:block md:h-0.5 md:w-12"
                aria-hidden
              />
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
