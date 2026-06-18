import Link from "next/link";
import type { CountyVaultAssetDetail } from "@/lib/county-vault/types";

type Props = {
  countySlug: string;
  countyDisplayName: string;
  asset: CountyVaultAssetDetail;
};

export function CountyVaultAssetExperience({ countySlug, countyDisplayName, asset }: Props) {
  const seo = asset.seo;
  const analysis = asset.analysis;

  return (
    <article>
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-kelly-muted">
        <Link href={`/counties/${countySlug}`} className="font-semibold text-kelly-navy hover:underline">
          {countyDisplayName}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/counties/${countySlug}/media`} className="font-semibold text-kelly-navy hover:underline">
          Media vault
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate">{asset.title}</span>
      </nav>

      <header className="border-b border-kelly-text/10 pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{asset.kind} · County vault</p>
        <h1 className="font-heading mt-2 text-3xl font-bold text-kelly-navy md:text-4xl">{seo?.title ?? asset.title}</h1>
        {(analysis?.summary || asset.description) && (
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-kelly-text/85">
            {analysis?.summary ?? asset.description}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={asset.fileUrl}
            download={seo?.fileTitle ?? asset.fileName}
            className="inline-flex rounded-lg bg-kelly-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            Download original
          </a>
          <Link
            href={`/counties/${countySlug}/media`}
            className="inline-flex rounded-lg border border-kelly-text/20 px-5 py-2.5 text-sm font-semibold text-kelly-navy hover:bg-kelly-wash"
          >
            Browse vault
          </Link>
        </div>
        {asset.issueTags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {asset.issueTags.map((t) => (
              <li key={t} className="rounded-full bg-kelly-navy/8 px-3 py-1 text-xs font-medium text-kelly-navy">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-kelly-text/10 bg-black/5 shadow-sm">
            {asset.kind === "VIDEO" ? (
              <video src={asset.fileUrl} controls className="aspect-video w-full bg-black" preload="metadata" />
            ) : asset.kind === "AUDIO" ? (
              <div className="p-8">
                <audio src={asset.fileUrl} controls className="w-full" />
              </div>
            ) : asset.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.fileUrl} alt={asset.title} className="max-h-[70vh] w-full object-contain" />
            ) : (
              <div className="flex aspect-video items-center justify-center p-8 text-center text-kelly-muted">
                <div>
                  <p className="text-lg font-semibold">{asset.mimeType}</p>
                  <a href={asset.fileUrl} className="mt-2 inline-block text-kelly-navy underline">
                    Open file
                  </a>
                </div>
              </div>
            )}
          </div>

          {analysis?.analysis ? (
            <section className="mt-10">
              <h2 className="font-heading text-xl font-bold text-kelly-navy">Deep analysis</h2>
              <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-kelly-text/85">{analysis.analysis}</div>
              {analysis.keyMoments && analysis.keyMoments.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {analysis.keyMoments.map((m, i) => (
                    <li key={i} className="rounded-xl border border-kelly-text/10 bg-kelly-wash/40 p-4 text-sm">
                      {m.timestamp ? (
                        <span className="font-mono text-xs font-bold text-kelly-gold">{m.timestamp}</span>
                      ) : null}
                      <p className="font-semibold text-kelly-navy">{m.label}</p>
                      {m.quote ? <p className="mt-1 italic text-kelly-text/75">&ldquo;{m.quote}&rdquo;</p> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-8 lg:col-span-2">
          {asset.transcriptText ? (
            <section className="rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">Transcript</h2>
              <div className="mt-3 max-h-[420px] overflow-y-auto text-sm leading-relaxed text-kelly-text/80 whitespace-pre-wrap">
                {asset.transcriptText}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-kelly-text/10 bg-white p-5 text-sm shadow-sm">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Details</h2>
            <dl className="mt-3 space-y-2">
              {asset.city ? (
                <>
                  <dt className="text-xs font-bold uppercase text-kelly-muted">City</dt>
                  <dd>{asset.city}</dd>
                </>
              ) : null}
              {asset.speakerName ? (
                <>
                  <dt className="text-xs font-bold uppercase text-kelly-muted">Speaker</dt>
                  <dd>{asset.speakerName}</dd>
                </>
              ) : null}
              {asset.capturedAt ? (
                <>
                  <dt className="text-xs font-bold uppercase text-kelly-muted">Captured</dt>
                  <dd>{new Date(asset.capturedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</dd>
                </>
              ) : null}
              {asset.durationSeconds ? (
                <>
                  <dt className="text-xs font-bold uppercase text-kelly-muted">Duration</dt>
                  <dd>{Math.floor(asset.durationSeconds / 60)}m {asset.durationSeconds % 60}s</dd>
                </>
              ) : null}
              <dt className="text-xs font-bold uppercase text-kelly-muted">File</dt>
              <dd className="font-mono text-xs break-all">{seo?.fileTitle ?? asset.fileName}</dd>
            </dl>
          </section>

          {analysis?.pullQuotes && analysis.pullQuotes.length > 0 ? (
            <section className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/5 p-5">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">Pull quotes</h2>
              <ul className="mt-3 space-y-2 text-sm italic text-kelly-text/85">
                {analysis.pullQuotes.map((q, i) => (
                  <li key={i}>&ldquo;{q}&rdquo;</li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
