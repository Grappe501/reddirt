import type { ReactNode } from "react";

import { figureById, type EvidenceClass, type FigureRecord } from "@/content/macroscopic-life/catalog";

const STROKE = "#f3ead8";
const MUTE = "#8d8678";
const ACCENT = "#e0b25a";
const LINE = "#2c313a";
const OBS = "#7eb3d4";

function Frame({ children, title }: { children: ReactNode; title: string }) {
  return (
    <svg viewBox="0 0 480 280" role="img" aria-label={title}>
      <rect width="480" height="280" fill="#080a0f" />
      <ellipse cx="240" cy="148" rx="210" ry="104" fill="none" stroke="#151a24" />
      <ellipse cx="240" cy="148" rx="140" ry="70" fill="none" stroke="#151a24" />
      <rect x="10" y="10" width="460" height="260" fill="none" stroke={LINE} />
      <path d="M10 34 H470 M10 248 H470" stroke={LINE} />
      {Array.from({ length: 15 }, (_, i) => (
        <path key={i} d={`M${26 + i * 30} 248 v7`} stroke={MUTE} />
      ))}
      <text x="18" y="26" fill={MUTE} fontSize="9">
        {title}
      </text>
      {children}
    </svg>
  );
}

function Fig01() {
  return (
    <Frame title="The embedded observer">
      <ellipse cx="300" cy="138" rx="118" ry="86" fill="none" stroke={MUTE} />
      <ellipse cx="214" cy="148" rx="62" ry="48" fill="none" stroke={STROKE} />
      <rect x="154" y="132" width="42" height="32" fill="none" stroke={ACCENT} />
      <circle cx="175" cy="148" r="5" fill={ACCENT} />
      <path d="M154 148 H112" stroke={ACCENT} />
      <text x="20" y="62" fill={MUTE} fontSize="10">local window</text>
      <text x="268" y="70" fill={MUTE} fontSize="10">containing body</text>
    </Frame>
  );
}

function Fig02() {
  return (
    <Frame title="Same landscape, different worlds">
      <path d="M28 190 C90 88, 160 210, 240 140 S360 86, 452 178" fill="none" stroke={MUTE} />
      <path d="M28 168 C110 120, 180 176, 260 128 S380 110, 452 160" fill="none" stroke={LINE} />
      <rect x="36" y="58" width="88" height="64" fill="none" stroke={STROKE} />
      <rect x="186" y="48" width="88" height="64" fill="none" stroke={ACCENT} />
      <rect x="336" y="68" width="88" height="64" fill="none" stroke={OBS} />
      <text x="52" y="94" fill={STROKE} fontSize="10">human</text>
      <text x="204" y="84" fill={ACCENT} fontSize="10">bee / UV</text>
      <text x="354" y="104" fill={OBS} fontSize="10">IR / other</text>
    </Frame>
  );
}

function Fig03() {
  return (
    <Frame title="Duration is another sense">
      {["1s", "day", "life", "century", "geology"].map((label, i) => (
        <g key={label}>
          <rect
            x={28 + i * 88}
            y={78 + i * 10}
            width={64 + i * 8}
            height="36"
            fill="none"
            stroke={i === 2 ? ACCENT : STROKE}
          />
          <text x={40 + i * 88} y={100 + i * 10} fill={MUTE} fontSize="10">
            {label}
          </text>
        </g>
      ))}
      <text x="20" y="230" fill={MUTE} fontSize="9">
        a process can be real and still miss the window
      </text>
    </Frame>
  );
}

function Fig04() {
  const rings = [22, 40, 60, 82, 106];
  return (
    <Frame title="Nested organization, not a ladder">
      {rings.map((r, i) => (
        <circle key={r} cx="220" cy="142" r={r} fill="none" stroke={i === 4 ? ACCENT : STROKE} />
      ))}
      <text x="20" y="62" fill={MUTE} fontSize="10">
        molecule - cell - tissue - organ - organism
      </text>
      <text x="20" y="230" fill={MUTE} fontSize="9">
        observational levels, not a progress stair
      </text>
    </Frame>
  );
}

function Fig05() {
  return (
    <Frame title="Cooperation is not yet individuality">
      <circle cx="86" cy="118" r="20" fill="none" stroke={STROKE} />
      <circle cx="132" cy="118" r="20" fill="none" stroke={STROKE} />
      <path d="M106 118 h6" stroke={MUTE} />
      <text x="78" y="168" fill={MUTE} fontSize="10">cooperate</text>
      <rect x="250" y="78" width="150" height="108" fill="none" stroke={ACCENT} />
      <circle cx="298" cy="122" r="16" fill="none" stroke={STROKE} />
      <circle cx="352" cy="122" r="16" fill="none" stroke={STROKE} />
      <path d="M298 138 v32 M352 138 v32 M298 170 H352" stroke={ACCENT} />
      <text x="276" y="210" fill={MUTE} fontSize="10">integrate + inherit</text>
    </Frame>
  );
}

function Fig06() {
  return (
    <Frame title="Three legitimate edges">
      <ellipse cx="214" cy="142" rx="118" ry="72" fill="none" stroke={STROKE} />
      <ellipse cx="236" cy="150" rx="88" ry="54" fill="none" stroke={ACCENT} />
      <ellipse cx="188" cy="128" rx="58" ry="36" fill="none" stroke={OBS} />
      <text x="20" y="62" fill={MUTE} fontSize="10">physical / regulatory / evolutionary</text>
      <text x="20" y="230" fill={MUTE} fontSize="9">permeable is not nonexistent</text>
    </Frame>
  );
}

function Fig07() {
  return (
    <Frame title="Ordinary charge at a thin membrane">
      <line x1="48" y1="88" x2="400" y2="88" stroke={STROKE} />
      <line x1="48" y1="176" x2="400" y2="176" stroke={STROKE} />
      <rect x="196" y="88" width="22" height="88" fill="none" stroke={ACCENT} />
      <circle cx="168" cy="108" r="4" fill={OBS} />
      <circle cx="248" cy="156" r="4" fill={ACCENT} />
      <text x="56" y="76" fill={MUTE} fontSize="10">outside</text>
      <text x="56" y="200" fill={MUTE} fontSize="10">inside</text>
      <text x="226" y="138" fill={ACCENT} fontSize="10">channel</text>
      <text x="20" y="230" fill={MUTE} fontSize="9">no aura, no life force</text>
    </Frame>
  );
}

function Fig08() {
  return (
    <Frame title="No cell holds the finished body">
      {[[84, 98], [156, 86], [228, 108], [300, 92], [372, 104]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="16" fill="none" stroke={STROKE} />
      ))}
      <path d="M84 114 C150 188, 270 188, 372 120" fill="none" stroke={ACCENT} />
      <text x="20" y="230" fill={MUTE} fontSize="9">local rules, not a miniature adult</text>
    </Frame>
  );
}

function Fig09() {
  return (
    <Frame title="Absence becomes local difference">
      <rect x="36" y="86" width="100" height="86" fill="none" stroke={STROKE} />
      <path d="M136 118 h48" stroke={ACCENT} />
      <rect x="184" y="86" width="100" height="86" fill="none" stroke={ACCENT} />
      <path d="M136 150 H184" stroke={LINE} />
      <path d="M284 118 h48" stroke={STROKE} />
      <rect x="332" y="86" width="86" height="86" fill="none" stroke={STROKE} />
      <text x="56" y="198" fill={MUTE} fontSize="10">intact</text>
      <text x="198" y="198" fill={MUTE} fontSize="10">perturbed</text>
      <text x="346" y="198" fill={MUTE} fontSize="10">restored</text>
    </Frame>
  );
}

function Fig10() {
  return (
    <Frame title="A trace must persist and return">
      {["event", "trace", "persist", "reuse"].map((label, i) => (
        <g key={label}>
          <rect x={28 + i * 110} y="108" width="88" height="42" fill="none" stroke={i === 3 ? ACCENT : STROKE} />
          <text x={48 + i * 110} y="134" fill={MUTE} fontSize="10">{label}</text>
          {i < 3 ? <path d={`M${116 + i * 110} 129 h22`} stroke={STROKE} /> : null}
        </g>
      ))}
      <text x="20" y="230" fill={MUTE} fontSize="9">trace is not recollection</text>
    </Frame>
  );
}

function Fig11() {
  return (
    <Frame title="If it cannot be wrong first, it is not prediction">
      <rect x="32" y="64" width="176" height="148" fill="none" stroke={STROKE} />
      <text x="48" y="90" fill={MUTE} fontSize="10">event then response</text>
      <path d="M56 168 H176" stroke={MUTE} />
      <circle cx="80" cy="168" r="5" fill={STROKE} />
      <circle cx="160" cy="168" r="5" fill={MUTE} />
      <rect x="248" y="64" width="176" height="148" fill="none" stroke={ACCENT} />
      <text x="264" y="90" fill={ACCENT} fontSize="10">prepare, then event</text>
      <text x="264" y="186" fill={MUTE} fontSize="10">can be wrong first</text>
    </Frame>
  );
}

function Fig12() {
  return (
    <Frame title="No neuron knows your name">
      {Array.from({ length: 12 }, (_, i) => (
        <circle
          key={i}
          cx={70 + (i % 4) * 42}
          cy={86 + Math.floor(i / 4) * 38}
          r="11"
          fill="none"
          stroke={STROKE}
        />
      ))}
      <rect x="286" y="86" width="130" height="100" fill="none" stroke={ACCENT} />
      <text x="308" y="140" fill={MUTE} fontSize="10">whole task</text>
      <text x="20" y="230" fill={MUTE} fontSize="9">no homunculus</text>
    </Frame>
  );
}

function Fig13() {
  return (
    <Frame title="Function can scale without a planetary brain">
      <circle cx="48" cy="140" r="10" fill="none" stroke={STROKE} />
      <path d="M58 140 H400" stroke={ACCENT} />
      <rect x="112" y="120" width="44" height="40" fill="none" stroke={STROKE} />
      <rect x="210" y="120" width="44" height="40" fill="none" stroke={STROKE} />
      <rect x="308" y="120" width="44" height="40" fill="none" stroke={STROKE} />
      <circle cx="416" cy="140" r="10" fill="none" stroke={STROKE} />
      <text x="20" y="230" fill={MUTE} fontSize="9">infrastructure is analogy, not identity</text>
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
    <Frame title="Property present is not individuality">
      <text x="20" y="62" fill={MUTE} fontSize="10">present? / evidence for a new individual?</text>
      {rows.map(([name, prop, ev], i) => (
        <g key={name}>
          <text x="24" y={88 + i * 24} fill={STROKE} fontSize="10">{name}</text>
          <text x="196" y={88 + i * 24} fill={ACCENT} fontSize="10">{prop}</text>
          <text x="310" y={88 + i * 24} fill={MUTE} fontSize="10">{ev}</text>
        </g>
      ))}
    </Frame>
  );
}

function Fig15() {
  return (
    <Frame title="The beautiful-idea trap">
      <circle cx="132" cy="138" r="58" fill="none" stroke={MUTE} />
      <path d="M92 98 L172 178 M172 98 L92 178" stroke={ACCENT} />
      <text x="96" y="216" fill={MUTE} fontSize="10">resemblance</text>
      <rect x="248" y="90" width="168" height="96" fill="none" stroke={STROKE} />
      <text x="276" y="134" fill={STROKE} fontSize="11">must be able</text>
      <text x="298" y="154" fill={STROKE} fontSize="11">to lose</text>
    </Frame>
  );
}

function Fig16() {
  return (
    <Frame title="Eleven tests, no organism score">
      {Array.from({ length: 11 }, (_, i) => (
        <rect
          key={i}
          x={22 + (i % 6) * 74}
          y={64 + Math.floor(i / 6) * 78}
          width="64"
          height="62"
          fill="none"
          stroke={i === 10 ? ACCENT : STROKE}
        />
      ))}
      <text x="20" y="230" fill={MUTE} fontSize="9">do not add these into a score</text>
    </Frame>
  );
}

function Fig17() {
  return (
    <Frame title="Evidence that would move the needle">
      {["for D", "against D", "alternative", "changes mind"].map((label, i) => (
        <g key={label}>
          <rect x="24" y={58 + i * 44} width="432" height="36" fill="none" stroke={i === 1 ? ACCENT : STROKE} />
          <text x="38" y={82 + i * 44} fill={MUTE} fontSize="11">{label}</text>
        </g>
      ))}
    </Frame>
  );
}

function Fig18() {
  return (
    <Frame title="Nested without diminishment">
      <circle cx="226" cy="142" r="28" fill="none" stroke={STROKE} />
      <circle cx="226" cy="142" r="58" fill="none" stroke={MUTE} />
      <circle cx="226" cy="142" r="92" fill="none" stroke={ACCENT} />
      <text x="20" y="230" fill={MUTE} fontSize="9">method, not taxonomy</text>
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
      <div className="ml-figure-head">
        <span className="ml-kicker">{figure.id} · {figure.title}</span>
        <EvidenceBadge evidenceClass={figure.evidenceClass} />
      </div>
      <FigureArt id={figure.id} />
      <p className="ml-takeaway">{figure.takeaway}</p>
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
