import type { ReactNode } from "react";

import { figureById, type EvidenceClass, type FigureRecord } from "@/content/macroscopic-life/catalog";

const STROKE = "#ece6d8";
const MUTE = "#9a9386";
const ACCENT = "#c4a46a";

function Frame({ children, title }: { children: ReactNode; title: string }) {
  return (
    <svg viewBox="0 0 360 220" role="img" aria-label={title}>
      <rect x="1" y="1" width="358" height="218" fill="#0c0d10" stroke={STROKE} strokeWidth="1" />
      {children}
    </svg>
  );
}

function Fig01() {
  return (
    <Frame title="Embedded observer inside a limited window">
      <ellipse cx="250" cy="110" rx="88" ry="78" fill="none" stroke={MUTE} />
      <ellipse cx="168" cy="118" rx="46" ry="40" fill="none" stroke={STROKE} />
      <circle cx="132" cy="124" r="16" fill="none" stroke={ACCENT} />
      <circle cx="132" cy="124" r="4" fill={ACCENT} />
      <path d="M116 124h-28" stroke={ACCENT} />
      <text x="16" y="28" fill={MUTE} fontSize="9">local window</text>
      <text x="200" y="36" fill={MUTE} fontSize="9">containing body</text>
    </Frame>
  );
}

function Fig02() {
  return (
    <Frame title="One landscape, three sensory windows">
      <path d="M20 160 C80 80, 140 180, 200 120 S300 70, 340 150" fill="none" stroke={MUTE} />
      <rect x="28" y="48" width="70" height="54" fill="none" stroke={STROKE} />
      <rect x="145" y="40" width="70" height="54" fill="none" stroke={ACCENT} />
      <rect x="262" y="56" width="70" height="54" fill="none" stroke={MUTE} />
      <text x="36" y="78" fill={STROKE} fontSize="8">human</text>
      <text x="158" y="70" fill={ACCENT} fontSize="8">bee / UV</text>
      <text x="274" y="86" fill={MUTE} fontSize="8">IR / other</text>
    </Frame>
  );
}

function Fig03() {
  return (
    <Frame title="Observation duration windows">
      {["1s", "day", "life", "century", "geology"].map((label, i) => (
        <g key={label}>
          <rect x={24 + i * 64} y={70 + i * 8} width={52 + i * 6} height="28" fill="none" stroke={i === 2 ? ACCENT : STROKE} />
          <text x={30 + i * 64} y={88 + i * 8} fill={MUTE} fontSize="8">{label}</text>
        </g>
      ))}
    </Frame>
  );
}

function Fig04() {
  const rings = [18, 32, 48, 66, 86];
  return (
    <Frame title="Nested biological organization">
      {rings.map((r) => (
        <circle key={r} cx="180" cy="112" r={r} fill="none" stroke={r === 86 ? ACCENT : STROKE} />
      ))}
      <text x="20" y="28" fill={MUTE} fontSize="8">molecule - cell - tissue - organ - organism</text>
      <text x="20" y="204" fill={MUTE} fontSize="8">observational levels, not a progress ladder</text>
    </Frame>
  );
}

function Fig05() {
  return (
    <Frame title="Cooperation is not yet individuality">
      <circle cx="70" cy="90" r="16" fill="none" stroke={STROKE} />
      <circle cx="108" cy="90" r="16" fill="none" stroke={STROKE} />
      <text x="54" y="140" fill={MUTE} fontSize="8">cooperate</text>
      <rect x="210" y="62" width="110" height="86" fill="none" stroke={ACCENT} />
      <circle cx="246" cy="96" r="12" fill="none" stroke={STROKE} />
      <circle cx="284" cy="96" r="12" fill="none" stroke={STROKE} />
      <path d="M246 108v28M284 108v28" stroke={ACCENT} />
      <text x="228" y="168" fill={MUTE} fontSize="8">integrate + inherit</text>
    </Frame>
  );
}

function Fig06() {
  return (
    <Frame title="Overlapping legitimate boundaries">
      <ellipse cx="170" cy="110" rx="90" ry="58" fill="none" stroke={STROKE} />
      <ellipse cx="190" cy="118" rx="70" ry="44" fill="none" stroke={ACCENT} />
      <ellipse cx="150" cy="100" rx="48" ry="30" fill="none" stroke={MUTE} />
      <text x="20" y="28" fill={MUTE} fontSize="8">physical / regulatory / evolutionary</text>
    </Frame>
  );
}

function Fig07() {
  return (
    <Frame title="Membrane potential as ordinary biophysics">
      <line x1="40" y1="70" x2="320" y2="70" stroke={STROKE} />
      <line x1="40" y1="150" x2="320" y2="150" stroke={STROKE} />
      <rect x="150" y="70" width="18" height="80" fill="none" stroke={ACCENT} />
      <text x="48" y="58" fill={MUTE} fontSize="8">outside</text>
      <text x="48" y="176" fill={MUTE} fontSize="8">inside</text>
      <text x="176" y="116" fill={ACCENT} fontSize="8">channel</text>
      <text x="48" y="204" fill={MUTE} fontSize="8">tiny charge separation at a thin membrane</text>
    </Frame>
  );
}

function Fig08() {
  return (
    <Frame title="No cell holds the finished blueprint">
      {[[70, 80], [130, 70], [190, 90], [250, 76], [300, 88]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="14" fill="none" stroke={STROKE} />
      ))}
      <path d="M70 94 C120 150, 220 150, 300 102" fill="none" stroke={ACCENT} />
      <text x="20" y="200" fill={MUTE} fontSize="8">local rules, not a miniature adult</text>
    </Frame>
  );
}

function Fig09() {
  return (
    <Frame title="Injury becomes local signals, then restored pattern">
      <rect x="30" y="70" width="80" height="70" fill="none" stroke={STROKE} />
      <path d="M110 90h40" stroke={ACCENT} />
      <rect x="150" y="70" width="80" height="70" fill="none" stroke={ACCENT} />
      <path d="M230 90h40" stroke={STROKE} />
      <rect x="270" y="70" width="60" height="70" fill="none" stroke={STROKE} />
      <text x="40" y="160" fill={MUTE} fontSize="8">intact</text>
      <text x="158" y="160" fill={MUTE} fontSize="8">perturbed</text>
      <text x="276" y="160" fill={MUTE} fontSize="8">restored</text>
    </Frame>
  );
}

function Fig10() {
  return (
    <Frame title="Memory chain from event to later reuse">
      {["event", "trace", "persist", "reuse"].map((label, i) => (
        <g key={label}>
          <rect x={24 + i * 84} y="86" width="70" height="36" fill="none" stroke={i === 3 ? ACCENT : STROKE} />
          <text x={36 + i * 84} y="108" fill={MUTE} fontSize="8">{label}</text>
          {i < 3 ? <path d={`M${94 + i * 84} 104h14`} stroke={STROKE} /> : null}
        </g>
      ))}
    </Frame>
  );
}

function Fig11() {
  return (
    <Frame title="Reaction versus anticipation">
      <rect x="24" y="50" width="140" height="120" fill="none" stroke={STROKE} />
      <text x="40" y="72" fill={MUTE} fontSize="8">event then response</text>
      <rect x="196" y="50" width="140" height="120" fill="none" stroke={ACCENT} />
      <text x="210" y="72" fill={ACCENT} fontSize="8">prepare, then event</text>
      <text x="210" y="150" fill={MUTE} fontSize="8">can be wrong first</text>
    </Frame>
  );
}

function Fig12() {
  return (
    <Frame title="Distributed capability without a little man">
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={70 + (i % 4) * 36} cy={80 + Math.floor(i / 4) * 36} r="10" fill="none" stroke={STROKE} />
      ))}
      <rect x="230" y="70" width="96" height="80" fill="none" stroke={ACCENT} />
      <text x="242" y="114" fill={MUTE} fontSize="8">whole task</text>
      <text x="20" y="200" fill={MUTE} fontSize="8">no homunculus</text>
    </Frame>
  );
}

function Fig13() {
  return (
    <Frame title="A message crossing infrastructure, not a planetary brain">
      <circle cx="40" cy="110" r="8" fill="none" stroke={STROKE} />
      <path d="M48 110 H310" stroke={ACCENT} />
      <rect x="90" y="94" width="36" height="32" fill="none" stroke={STROKE} />
      <rect x="170" y="94" width="36" height="32" fill="none" stroke={STROKE} />
      <rect x="250" y="94" width="36" height="32" fill="none" stroke={STROKE} />
      <circle cx="320" cy="110" r="8" fill="none" stroke={STROKE} />
      <text x="20" y="200" fill={MUTE} fontSize="8">function scales; agency is not shown</text>
    </Frame>
  );
}

function Fig14() {
  const rows: [string, string, string][] = [
    ["boundary", "mixed", "weak"],
    ["integration", "strong", "mixed"],
    ["memory", "strong", "weak"],
    ["repair", "mixed", "weak"],
    ["reproduction", "weak", "weak"],
    ["model advantage", "mixed", "unresolved"],
  ];
  return (
    <Frame title="Civilization property versus individuality evidence">
      <text x="20" y="28" fill={MUTE} fontSize="8">property present? / evidence for individuality?</text>
      {rows.map(([name, prop, ev], i) => (
        <g key={name}>
          <text x="20" y={56 + i * 24} fill={STROKE} fontSize="8">{name}</text>
          <text x="160" y={56 + i * 24} fill={ACCENT} fontSize="8">{prop}</text>
          <text x="250" y={56 + i * 24} fill={MUTE} fontSize="8">{ev}</text>
        </g>
      ))}
    </Frame>
  );
}

function Fig15() {
  return (
    <Frame title="The beautiful-idea trap">
      <circle cx="110" cy="110" r="48" fill="none" stroke={MUTE} />
      <path d="M78 78 L142 142 M142 78 L78 142" stroke={ACCENT} />
      <text x="78" y="178" fill={MUTE} fontSize="8">resemblance</text>
      <rect x="200" y="70" width="120" height="80" fill="none" stroke={STROKE} />
      <text x="214" y="112" fill={STROKE} fontSize="8">must be able</text>
      <text x="226" y="128" fill={STROKE} fontSize="8">to lose</text>
    </Frame>
  );
}

function Fig16() {
  return (
    <Frame title="Eleven tests, no organism score">
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={16 + (i % 6) * 56} y={50 + Math.floor(i / 6) * 70} width="50" height="54" fill="none" stroke={i === 10 ? ACCENT : STROKE} />
      ))}
      <text x="20" y="204" fill={MUTE} fontSize="8">do not add these into a score</text>
    </Frame>
  );
}

function Fig17() {
  return (
    <Frame title="Evidence that would move the needle">
      {["for D", "against D", "alternative", "changes mind"].map((label, i) => (
        <g key={label}>
          <rect x="20" y={46 + i * 38} width="320" height="30" fill="none" stroke={i === 1 ? ACCENT : STROKE} />
          <text x="32" y={66 + i * 38} fill={MUTE} fontSize="9">{label}</text>
        </g>
      ))}
    </Frame>
  );
}

function Fig18() {
  return (
    <Frame title="Nested without diminishment">
      <circle cx="180" cy="110" r="24" fill="none" stroke={STROKE} />
      <circle cx="180" cy="110" r="48" fill="none" stroke={MUTE} />
      <circle cx="180" cy="110" r="74" fill="none" stroke={ACCENT} />
      <text x="20" y="204" fill={MUTE} fontSize="8">method, not taxonomy</text>
    </Frame>
  );
}

const RENDERERS: Record<string, () => ReactNode> = {
  "fig-01": Fig01,
  "fig-02": Fig02,
  "fig-03": Fig03,
  "fig-04": Fig04,
  "fig-05": Fig05,
  "fig-06": Fig06,
  "fig-07": Fig07,
  "fig-08": Fig08,
  "fig-09": Fig09,
  "fig-10": Fig10,
  "fig-11": Fig11,
  "fig-12": Fig12,
  "fig-13": Fig13,
  "fig-14": Fig14,
  "fig-15": Fig15,
  "fig-16": Fig16,
  "fig-17": Fig17,
  "fig-18": Fig18,
};

export function EvidenceBadge({ evidenceClass }: { evidenceClass: EvidenceClass }) {
  const label = evidenceClass === "observed" ? "Observed" : evidenceClass === "model" ? "Model" : "Hypothesis";
  return (
    <span className="ml-badge" data-class={evidenceClass}>
      {label}
    </span>
  );
}

export function FigureArt({ id }: { id: string }) {
  const Renderer = RENDERERS[id];
  if (!Renderer) return null;
  return <Renderer />;
}

export function FigureObject({
  figure,
  href,
}: {
  figure: FigureRecord;
  href?: string;
}) {
  const inner = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.65rem" }}>
        <span className="ml-kicker">{figure.id}</span>
        <EvidenceBadge evidenceClass={figure.evidenceClass} />
      </div>
      <FigureArt id={figure.id} />
      <p style={{ margin: "0.7rem 0 0", fontFamily: "var(--ml-serif)", fontSize: "1rem" }}>{figure.takeaway}</p>
      <p className="ml-brake">
        <strong>Scientific brake. </strong>
        {figure.brake}
      </p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="ml-figure" style={{ display: "block", textDecoration: "none" }}>
        {inner}
      </a>
    );
  }

  return <figure className="ml-figure">{inner}</figure>;
}

export function FigureById({ id, href }: { id: string; href?: string }) {
  const figure = figureById(id);
  if (!figure) return null;
  return <FigureObject figure={figure} href={href} />;
}
