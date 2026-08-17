import {
  getCampaignBlogArchiveUrl,
  getCampaignBlogEmbedUrl,
  getCampaignBlogSubscribeUrl,
} from "@/config/external-campaign";
import { fromTheRoadJournalCopy } from "@/content/road/on-the-road";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showEmbed?: boolean;
};

export function SubscribeToKellySubstack({ className, showEmbed = true }: Props) {
  const copy = fromTheRoadJournalCopy;
  const subscribeHref = getCampaignBlogSubscribeUrl();
  const archiveHref = getCampaignBlogArchiveUrl();
  const embedSrc = getCampaignBlogEmbedUrl();

  return (
    <aside
      className={cn(
        "rounded-card border border-kelly-navy/15 bg-white/90 p-6 shadow-[var(--shadow-soft)] md:p-8",
        className,
      )}
    >
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">Stay with the journal</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-ink md:text-2xl">{copy.subscribeTitle}</h2>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-kelly-slate md:text-base">{copy.subscribeBody}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button href={subscribeHref} variant="primary">
          {copy.subscribeCta}
        </Button>
        <Button href={archiveHref} variant="outline">
          {copy.archiveOnSubstackCta}
        </Button>
      </div>
      {showEmbed ? (
        <div className="mt-6 max-w-md overflow-hidden rounded-lg border border-kelly-ink/10 bg-white">
          <iframe
            src={embedSrc}
            title="Subscribe to Kelly Grappe on Substack"
            className="h-[320px] w-full"
            loading="lazy"
          />
        </div>
      ) : null}
    </aside>
  );
}
