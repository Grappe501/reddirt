export function EventSocialGraphic({ src, title }: { src: string; title: string }) {
  return (
    <figure className="overflow-hidden rounded-card border border-kelly-navy/15 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${title} social graphic`} className="h-auto w-full" />
    </figure>
  );
}
