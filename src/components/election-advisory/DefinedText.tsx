"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { getAeacGlossaryTerm } from "@/content/election-advisory/glossary";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { splitAeacDefinedText } from "@/lib/election-advisory/annotate-text";

export function DefinedText({ text, base }: { text: string; base: string }) {
  const parts = splitAeacDefinedText(text);
  return (
    <>
      {parts.map((part, index) =>
        part.type === "text" ? (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ) : (
          <DefinedTerm key={`${part.slug}-${index}`} slug={part.slug} value={part.value} base={base} />
        ),
      )}
    </>
  );
}

export function AeacProse({ text, base, className = "aeac-prose" }: { text: string; base: string; className?: string }) {
  return (
    <p className={className}>
      <DefinedText text={text} base={base} />
    </p>
  );
}

function DefinedTerm({ slug, value, base }: { slug: string; value: string; base: string }) {
  const term = getAeacGlossaryTerm(slug);
  const router = useRouter();
  const bubbleId = useId();
  const [open, setOpen] = useState(false);
  if (!term) return <>{value}</>;

  const href = aeacHref(base, `library/${term.slug}`);

  return (
    <span
      className="aeac-term-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="aeac-term"
        aria-describedby={open ? bubbleId : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => router.push(href)}
      >
        {value}
      </button>
      {open ? (
        <span className="aeac-bubble" id={bubbleId} role="tooltip">
          <strong>{term.term}</strong>
          <span>{term.shortDefinition}</span>
          <button type="button" className="aeac-bubble-link" onMouseDown={(event) => event.preventDefault()} onClick={() => router.push(href)}>
            Open the deep dive
          </button>
        </span>
      ) : null}
    </span>
  );
}
