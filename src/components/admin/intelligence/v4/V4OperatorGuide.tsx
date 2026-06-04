import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4GuideDepthBlocks } from "@/components/admin/intelligence/v4/V4EncounterDepthPanel";

/** Operator guides hidden globally — candidate finds top-of-page meta distracting; data kept for staff re-enable. */
function shouldHideOperatorGuide(): boolean {
  return true;
}

function parseFinding(item: string): { tag: "offensive" | "defensive" | "verify" | "general"; text: string } {
  if (item.startsWith("[OFFENSE] ")) return { tag: "offensive", text: item.slice(10) };
  if (item.startsWith("[DEFENSE] ")) return { tag: "defensive", text: item.slice(10) };
  if (item.startsWith("[VERIFY] ")) return { tag: "verify", text: item.slice(9) };
  return { tag: "general", text: item };
}

const tagStyle = {
  offensive: "border-rose-200 bg-rose-50/50 text-rose-950",
  defensive: "border-emerald-200 bg-emerald-50/50 text-emerald-950",
  verify: "border-amber-200 bg-amber-50/50 text-amber-950",
  general: "border-kelly-text/10 bg-kelly-page/30 text-kelly-muted",
};

const tagLabel = {
  offensive: "Offensive",
  defensive: "Defensive",
  verify: "Verify before stage",
  general: "Look for",
};

export function V4OperatorGuide({ guide, compact }: { guide: OperatorGuide; compact?: boolean }) {
  if (shouldHideOperatorGuide()) return null;

  const parsed = guide.whatToLookFor.map(parseFinding);
  const hasTags = parsed.some((p) => p.tag !== "general");

  if (compact) {
    return (
      <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/40 p-3 text-xs text-sky-950">
        <p className="font-bold uppercase tracking-wider text-sky-900">How to use this</p>
        <p className="mt-1">{guide.whenToUse}</p>
        <p className="mt-2 text-sky-900/90">{guide.howToUseInDebate}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-sky-200/60 bg-sky-50/30 p-4 text-xs leading-relaxed text-kelly-text">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-900">Operator guide — how this fits your debate</p>
      <GuideBlock label="Why it matters" text={guide.whyItMatters} />
      <GuideBlock label="How it fits debate prep" text={guide.howItFitsDebatePrep} />
      <GuideBlock label="How it ties together" text={guide.tiesTogether} />
      <div>
        <p className="font-bold text-kelly-navy">What to look for — staff findings (record-backed)</p>
        <p className="mt-1 text-[10px] text-kelly-subtle">
          Offensive = Kelly attack lanes · Defensive = protect Kelly · Verify = claims gate before stage
        </p>
        <ul className="mt-3 space-y-2">
          {parsed.map((item) => (
            <li
              key={item.text.slice(0, 56)}
              className={`rounded-lg border px-3 py-2 ${tagStyle[item.tag]}`}
            >
              {hasTags ? (
                <span className="mr-2 text-[10px] font-bold uppercase">{tagLabel[item.tag]}</span>
              ) : null}
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <GuideBlock label="How to set up (before debate)" text={guide.howToSetUp} />
      <GuideBlock label="When to use" text={guide.whenToUse} />
      <GuideBlock label="How to use in the debate" text={guide.howToUseInDebate} />
      <GuideBlock label="On the campaign trail" text={guide.campaignTrailUse} />
      <V4GuideDepthBlocks guide={guide} />
    </div>
  );
}

function GuideBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-bold text-kelly-navy">{label}</p>
      <p className="mt-1 text-kelly-muted">{text}</p>
    </div>
  );
}
