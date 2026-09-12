export type MediaRef = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position when the still is cropped to fill a slot. */
  objectPosition?: string;
  seoTitle?: string;
  seoDescription?: string;
  caption?: string;
  credit?: string;
};

const CREDIT = "Kelly Grappe for Secretary of State. All rights reserved.";

export function kellyStill(input: {
  src: string;
  /** Honest scene — do not invent a county, city, or endorsement. */
  scene: string;
  width: number;
  height: number;
  objectPosition?: string;
  place?: string;
}): MediaRef {
  const placeBit = input.place ? ` in ${input.place}` : "";
  const alt = `Kelly Grappe, candidate for Arkansas Secretary of State, ${input.scene}${placeBit}.`;
  return {
    src: input.src,
    alt,
    width: input.width,
    height: input.height,
    objectPosition: input.objectPosition ?? (input.height > input.width ? "50% 22%" : "50% 38%"),
    seoTitle: `Kelly Grappe for Arkansas Secretary of State — ${input.scene}`,
    seoDescription: `${alt} People Over Politics. The People Rule.`,
    caption: alt,
    credit: CREDIT,
  };
}

export function attachKellySeo(m: MediaRef): MediaRef {
  if (m.src.includes("/placeholders/")) {
    return {
      ...m,
      seoTitle: m.seoTitle ?? "Kelly Grappe for Arkansas Secretary of State",
      seoDescription: m.seoDescription ?? m.alt,
      caption: m.caption ?? m.alt,
      credit: m.credit ?? CREDIT,
    };
  }
  const alt = /secretary of state/i.test(m.alt)
    ? m.alt
    : `Kelly Grappe, candidate for Arkansas Secretary of State. ${m.alt}`;
  return {
    ...m,
    alt,
    seoTitle: m.seoTitle ?? "Kelly Grappe for Arkansas Secretary of State — campaign photo",
    seoDescription: m.seoDescription ?? `${alt} People Over Politics. The People Rule.`,
    caption: m.caption ?? alt,
    credit: m.credit ?? CREDIT,
  };
}
