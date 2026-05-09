export type StrategyBlock =
  | { kind: "lead"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | {
      kind: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | { kind: "callout"; tone: "info" | "gold" | "navy"; title: string; body: string }
  | {
      kind: "cards";
      items: { title: string; description: string; href?: string; path?: string }[];
    };

export type StrategyDoc = {
  /** URL segments joined by "/" — "" for hub */
  path: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  blocks: StrategyBlock[];
};

export type StrategyNavSection = {
  id: string;
  title: string;
  items: { path: string; label: string }[];
};
