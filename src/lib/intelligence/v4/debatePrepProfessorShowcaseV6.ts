/**
 * Professor showcase v6 — cinematic seminar skins per mode.
 */
import type { DebatePrepProfessorMode } from "@/lib/intelligence/v4/debatePrepProfessorV5";
import type { DebatePrepTutorMode } from "@/lib/intelligence/v4/debatePrepTutorPackage";

export const PROFESSOR_SHOWCASE_V6_VERSION = "showcase-v6.0";

export type ShowcaseSkin = {
  id: string;
  label: string;
  icon: string;
  heroGradient: string;
  cardBorder: string;
  cardBg: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  ruleColor: string;
  mood: string;
};

export const PROFESSOR_SHOWCASE_SKINS: Record<DebatePrepProfessorMode, ShowcaseSkin> = {
  "office-hours-10": {
    id: "office-hours",
    label: "Office hours",
    icon: "🪔",
    heroGradient: "bg-office-hours-warm",
    cardBorder: "border-amber-300/80",
    cardBg: "bg-gradient-to-br from-amber-50 via-white to-violet-50/40",
    accentText: "text-amber-950",
    badgeBg: "bg-amber-200/80",
    badgeText: "text-amber-950",
    ruleColor: "border-amber-400",
    mood: "Warm desk lamp — one concept, deep understanding",
  },
  "seminar-25": {
    id: "seminar",
    label: "Seminar hall",
    icon: "📚",
    heroGradient: "bg-seminar-hall",
    cardBorder: "border-kelly-gold/60",
    cardBg: "bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/50",
    accentText: "text-kelly-navy",
    badgeBg: "bg-kelly-gold/25",
    badgeText: "text-kelly-navy",
    ruleColor: "border-kelly-gold",
    mood: "Collegiate seminar — thesis, evidence, Socratic defense",
  },
  "moot-court-45": {
    id: "moot-court",
    label: "Moot court",
    icon: "⚖️",
    heroGradient: "bg-moot-court-bench",
    cardBorder: "border-fuchsia-400 animate-moot-pulse",
    cardBg: "bg-gradient-to-br from-fuchsia-50 via-white to-violet-100/60",
    accentText: "text-fuchsia-950",
    badgeBg: "bg-fuchsia-200/70",
    badgeText: "text-fuchsia-950",
    ruleColor: "border-fuchsia-500",
    mood: "Adversarial rehearsal — cross-exam, rubric, survive",
  },
  "forensic-audit": {
    id: "forensic",
    label: "Forensic audit",
    icon: "🔍",
    heroGradient: "bg-gradient-to-br from-slate-100 via-white to-amber-50",
    cardBorder: "border-slate-400",
    cardBg: "bg-gradient-to-br from-slate-50 to-white",
    accentText: "text-slate-900",
    badgeBg: "bg-slate-200/80",
    badgeText: "text-slate-900",
    ruleColor: "border-slate-500",
    mood: "Rhetorical autopsy — grade before you memorize",
  },
};

export const COACH_SHOWCASE_SKIN: ShowcaseSkin = {
  id: "green-room",
  label: "Green room coach",
  icon: "🎙️",
  heroGradient: "bg-gradient-to-br from-emerald-50 via-white to-cyan-50/40",
  cardBorder: "border-emerald-400",
  cardBg: "bg-gradient-to-br from-emerald-50/80 to-white",
  accentText: "text-emerald-950",
  badgeBg: "bg-emerald-200/70",
  badgeText: "text-emerald-950",
  ruleColor: "border-emerald-500",
  mood: "Fast prep — clock running, one card at a time",
};

export const COACH_MODE_ACCENTS: Record<DebatePrepTutorMode, string> = {
  "panic-5": "border-rose-400 shadow-rose-200/50",
  "tonight-15": "border-indigo-400 shadow-indigo-200/50",
  "deep-30": "border-violet-400 shadow-violet-200/50",
  "check-my-record": "border-amber-400 shadow-amber-200/50",
  "three-way-panel": "border-cyan-400 shadow-cyan-200/50",
};

export const EVIDENCE_TIER_CHIPS = [
  { tier: "verified", label: "Tier A · Verified", color: "bg-emerald-600 text-white", desc: "Human-verified · stage clear" },
  { tier: "verify_first", label: "Tier B · Verify first", color: "bg-amber-500 text-amber-950", desc: "NEEDS_REVIEW until staff clears" },
  { tier: "research", label: "Tier C · Research", color: "bg-slate-500 text-white", desc: "Research question frame only" },
] as const;

export const SHOWCASE_HERO_COPY = {
  headline: "The seminar room is open.",
  subhead:
    "Tonight's last impression starts here — professor depth, coach speed, opponents research wired into one command surface.",
  pillars: [
    { title: "Why before what", body: "Every mode explains the civics frame before handing you a line." },
    { title: "Forensic standard", body: "Thesis → evidence → pivot. Arkleg receipts or research questions — never gossip." },
    { title: "Stage gates honored", body: "Blocked lines stay blocked. Staff verifies before anything goes live." },
  ],
};

export function getProfessorSkin(mode: DebatePrepProfessorMode): ShowcaseSkin {
  return PROFESSOR_SHOWCASE_SKINS[mode];
}
