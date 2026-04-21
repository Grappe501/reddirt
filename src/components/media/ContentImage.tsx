import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaRef } from "@/content/media/registry";

type ContentImageProps = {
  media: MediaRef;
  className?: string;
  priority?: boolean;
  sizes?: string;
  warmOverlay?: boolean;
};

export function ContentImage({
  media: m,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 1200px",
  warmOverlay,
}: ContentImageProps) {
  const isSvg = m.src.endsWith(".svg");
  const imgClass = "h-full w-full object-cover";

  const inner = isSvg ? (
    // SVG placeholders in /public — next/image SVG optimization not enabled; explicit dimensions prevent CLS.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={m.src}
      alt={m.alt}
      width={m.width}
      height={m.height}
      className={imgClass}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
    />
  ) : (
    <Image
      src={m.src}
      alt={m.alt}
      width={m.width}
      height={m.height}
      className={imgClass}
      sizes={sizes}
      priority={priority}
    />
  );

  const wrap = (child: ReactNode) => (
    <span className={cn("relative block h-full w-full overflow-hidden", className)}>{child}</span>
  );

  if (!warmOverlay) return wrap(inner);

  return (
    <span className={cn("relative block h-full w-full overflow-hidden", className)}>
      {inner}
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-red-dirt/[0.12] via-transparent to-field-green/[0.08] mix-blend-multiply"
        aria-hidden
      />
    </span>
  );
}
