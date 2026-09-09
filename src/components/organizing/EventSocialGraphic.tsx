export function EventSocialGraphic({
  src,
  title,
  alt,
  className,
}: {
  src: string;
  title: string;
  alt?: string;
  className?: string;
}) {
  return (
    <figure className={className ?? "overflow-hidden rounded-card border border-kelly-navy/15 bg-white"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt?.trim() || `${title} event flyer`} className="h-auto w-full" />
    </figure>
  );
}
