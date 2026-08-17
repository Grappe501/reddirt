import Image from "next/image";

export function EventFlyer({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]">
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

export function EventFlyerGallery({ items }: { items: Array<{ src: string; alt: string }> }) {
  if (!items.length) return null;
  return (
    <section className="mt-8" aria-label="Event flyers">
      <p className="mb-3 font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Flyers</p>
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.src}>
            <EventFlyer src={item.src} alt={item.alt} />
          </li>
        ))}
      </ul>
    </section>
  );
}
