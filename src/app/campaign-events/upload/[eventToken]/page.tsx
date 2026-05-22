import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Public/link upload scaffold — not operational this pass.
 * See docs/campaign-events/HOT_WASH_PUBLIC_UPLOAD_FUTURE.md
 */
export default async function PublicEventUploadScaffoldPage({
  params,
}: {
  params: Promise<{ eventToken: string }>;
}) {
  const { eventToken } = await params;

  return (
    <main className="mx-auto max-w-lg px-6 py-16 font-body">
      <h1 className="font-heading text-2xl font-bold">Event media upload (coming soon)</h1>
      <p className="mt-4 text-sm text-kelly-text/75">
        Token <code className="rounded bg-kelly-wash px-1">{eventToken}</code> — public upload is not enabled yet. Hosts and
        volunteers will use a signed link to submit photos, videos, and remarks into the <strong>pending approval</strong> queue
        only.
      </p>
      <ul className="mt-6 list-inside list-disc text-sm text-kelly-text/65">
        <li>Uploader name, email, phone</li>
        <li>Images, videos, audio/speeches</li>
        <li>Optional caption + permission checkbox</li>
        <li>No merge into official county folders until campaign manager approval</li>
      </ul>
      <p className="mt-8 text-xs text-kelly-text/50">
        Operators: use{" "}
        <Link href="/admin/campaign-events/workbench" className="underline">
          admin Hot Wash upload
        </Link>{" "}
        on the event drilldown for now.
      </p>
    </main>
  );
}
