import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

export function SubstackArticleBody({ html, className }: Props) {
  if (!html.trim()) return null;
  return (
    <div
      className={cn(
        "from-the-road-article font-body text-[1.0625rem] leading-[1.8] text-kelly-text/88 md:text-lg",
        "[&_p]:mt-5 [&_p:first-child]:mt-0",
        "[&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-kelly-ink",
        "[&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-kelly-ink",
        "[&_h4]:mt-6 [&_h4]:font-heading [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-kelly-ink",
        "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:mt-2",
        "[&_blockquote]:mt-6 [&_blockquote]:border-l-4 [&_blockquote]:border-kelly-gold [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-kelly-text/80",
        "[&_a]:font-semibold [&_a]:text-kelly-navy [&_a]:underline [&_a]:decoration-kelly-navy/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-kelly-navy",
        "[&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-card [&_img]:object-cover",
        "[&_figure]:my-8 [&_figcaption]:mt-2 [&_figcaption]:font-body [&_figcaption]:text-sm [&_figcaption]:text-kelly-slate",
        "[&_hr]:my-10 [&_hr]:border-kelly-ink/10",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
