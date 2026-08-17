import Image from "next/image";

export function EventFlyer({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mt-8 overflow-hidden rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]">
      <figcaption className="border-b border-kelly-text/10 px-4 py-3 font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">
        Flyer
      </figcaption>
      <a href={src} target="_blank" rel="noopener noreferrer" className="block">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1600}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 720px, 100vw"
        />
      </a>
    </figure>
  );
}
