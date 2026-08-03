"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  KICKOFF_BASE,
  KICKOFF_SLIDES,
  kickoffHref,
  slideIndexByPath,
} from "@/content/volunteer-kickoff/slides";
import { cn } from "@/lib/utils";

type KickoffMode = "present" | "follow";

type KickoffChromeContextValue = {
  mode: KickoffMode;
  setMode: (mode: KickoffMode) => void;
  index: number;
  total: number;
  isFormRoute: boolean;
};

const KickoffChromeContext = createContext<KickoffChromeContextValue | null>(null);

export function useKickoffChrome() {
  const ctx = useContext(KickoffChromeContext);
  if (!ctx) throw new Error("useKickoffChrome must be used within KickoffShell");
  return ctx;
}

function pathSegment(pathname: string): string | undefined {
  const rest = pathname.replace(new RegExp(`^${KICKOFF_BASE}/?`), "");
  if (!rest) return undefined;
  const first = rest.split("/")[0];
  if (["join", "thank-you"].includes(first)) return first;
  return first || undefined;
}

function isFormPath(pathname: string): boolean {
  return (
    pathname.startsWith(`${KICKOFF_BASE}/join/`) ||
    pathname === `${KICKOFF_BASE}/thank-you` ||
    pathname.startsWith(`${KICKOFF_BASE}/thank-you/`)
  );
}

export function KickoffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || KICKOFF_BASE;
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRoute = isFormPath(pathname);

  const segment = pathSegment(pathname);
  const slideSeg =
    segment && !["join", "thank-you"].includes(segment) ? segment : segment === "join" ? "join" : "";
  const index = formRoute ? -1 : slideIndexByPath(slideSeg === "join" ? "join" : slideSeg || "");

  const [mode, setModeState] = useState<KickoffMode>(() =>
    searchParams.get("mode") === "follow" ? "follow" : "present",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const setMode = useCallback(
    (next: KickoffMode) => {
      setModeState(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "follow") params.set("mode", "follow");
      else params.delete("mode");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const go = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(KICKOFF_SLIDES.length - 1, nextIndex));
      const slide = KICKOFF_SLIDES[clamped];
      const q = mode === "follow" ? "?mode=follow" : "";
      router.push(`${kickoffHref(slide.path)}${q}`);
    },
    [mode, router],
  );

  useEffect(() => {
    if (formRoute) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formRoute, fullscreen, go, index]);

  useEffect(() => {
    if (formRoute) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.changedTouches[0]?.clientX ?? 0;
    };
    const onEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0]?.clientX ?? 0;
      const dx = endX - startX;
      if (Math.abs(dx) < 60) return;
      if (dx < 0) go(index + 1);
      else go(index - 1);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [formRoute, go, index]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      index: Math.max(0, index),
      total: KICKOFF_SLIDES.length,
      isFormRoute: formRoute,
    }),
    [formRoute, index, mode, setMode],
  );

  const progressLabel =
    index >= 0 ? `${index + 1} of ${KICKOFF_SLIDES.length}` : "Sign up";

  return (
    <KickoffChromeContext.Provider value={value}>
      <div
        className={cn(
          "kickoff-root min-h-dvh bg-[var(--kelly-fog)] text-[var(--color-text-primary)]",
          fullscreen && "kickoff-fullscreen fixed inset-0 z-[80] overflow-y-auto",
          mode === "present" && !formRoute && "kickoff-present",
        )}
      >
        <header className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-[var(--kelly-official-navy)] text-[var(--text-on-navy)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
                Kelly Grappe for Secretary of State
              </p>
              <p className="truncate font-body text-sm text-[var(--text-subtle-on-navy)]">
                Statewide Volunteer Leadership Kickoff
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === "present" ? "follow" : "present")}
                className="rounded-btn border border-white/25 px-3 py-2 text-xs font-semibold text-[var(--text-on-navy)] hover:border-white/50"
              >
                {mode === "present" ? "Follow-Along" : "Presenter"}
              </button>
              <button
                type="button"
                onClick={() => setFullscreen((v) => !v)}
                className="hidden rounded-btn border border-white/25 px-3 py-2 text-xs font-semibold sm:inline-flex"
              >
                {fullscreen ? "Exit full screen" : "Full screen"}
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-btn border border-white/25 px-3 py-2 text-xs font-semibold"
                aria-expanded={menuOpen}
              >
                Menu
              </button>
              <Link
                href={`${KICKOFF_BASE}/join`}
                className="rounded-btn bg-[var(--kelly-official-gold)] px-3 py-2 text-xs font-bold text-[var(--kelly-official-navy)] shadow-[var(--shadow-gold-cta)]"
              >
                Volunteer Now
              </Link>
            </div>
          </div>

          {menuOpen ? (
            <nav
              className="border-t border-white/15 bg-[var(--kelly-deep)] px-4 py-4 sm:px-6"
              aria-label="Presentation sections"
            >
              <ul className="mx-auto grid max-w-6xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {KICKOFF_SLIDES.map((slide, i) => (
                  <li key={slide.id}>
                    <Link
                      href={`${kickoffHref(slide.path)}${mode === "follow" ? "?mode=follow" : ""}`}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm hover:bg-white/10",
                        i === index && "bg-white/15 text-[var(--kelly-official-gold)]",
                      )}
                    >
                      <span className="font-heading text-xs opacity-70">{i + 1}</span>
                      <span>{slide.navLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mx-auto mt-3 max-w-6xl font-body text-xs text-[var(--text-soft-on-navy)]">
                {mode === "follow"
                  ? "Follow-along: browse any section and sign up whenever you are ready."
                  : "Presenter: use arrow keys or Back / Next. Share this same link with attendees."}
              </p>
            </nav>
          ) : null}
        </header>

        <main
          className={cn(
            "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10",
            mode === "present" && !formRoute && "flex min-h-[calc(100dvh-9.5rem)] flex-col justify-center py-6 sm:py-8",
          )}
        >
          {children}
        </main>

        {!formRoute ? (
          <footer className="sticky bottom-0 z-30 border-t border-[var(--color-border-subtle)] bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index <= 0}
                className="min-h-12 min-w-[5.5rem] rounded-btn border-2 border-[var(--kelly-official-navy)]/25 px-4 font-semibold disabled:opacity-40"
              >
                Back
              </button>
              <div className="flex-1 text-center">
                <p className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-[var(--kelly-official-navy)]">
                  {progressLabel}
                </p>
                <div className="mx-auto mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-[var(--kelly-mist)]">
                  <div
                    className="h-full rounded-full bg-[var(--kelly-official-gold)] transition-all duration-300"
                    style={{
                      width: `${index >= 0 ? ((index + 1) / KICKOFF_SLIDES.length) * 100 : 100}%`,
                    }}
                  />
                </div>
              </div>
              <Link
                href={`${KICKOFF_BASE}/join`}
                className="hidden min-h-12 items-center rounded-btn bg-[var(--kelly-official-navy)] px-4 font-semibold text-white sm:inline-flex"
              >
                Volunteer Now
              </Link>
              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={index >= KICKOFF_SLIDES.length - 1}
                className="min-h-12 min-w-[5.5rem] rounded-btn bg-[var(--kelly-official-gold)] px-4 font-bold text-[var(--kelly-official-navy)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        ) : (
          <footer className="border-t border-[var(--color-border-subtle)] bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <Link href={`${KICKOFF_BASE}/join`} className="font-semibold text-[var(--kelly-official-navy)]">
                ← Back to choices
              </Link>
              <Link href={KICKOFF_BASE} className="text-sm text-[var(--color-secondary)]">
                Return to presentation
              </Link>
            </div>
          </footer>
        )}
      </div>
    </KickoffChromeContext.Provider>
  );
}
