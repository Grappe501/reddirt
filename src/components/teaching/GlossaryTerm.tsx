"use client";

import type { GlossaryTermId } from "@/lib/teaching/glossary";
import { GLOSSARY } from "@/lib/teaching/glossary";
import { DefineTerm } from "./DefineTerm";

type Props = {
  term: GlossaryTermId;
  /** Override display text; defaults to glossary label. */
  children?: React.ReactNode;
  className?: string;
};

export function GlossaryTerm({ term, children, className }: Props) {
  const g = GLOSSARY[term];
  return (
    <DefineTerm definition={g.definition} hint={g.hint} className={className}>
      {children ?? g.label}
    </DefineTerm>
  );
}
