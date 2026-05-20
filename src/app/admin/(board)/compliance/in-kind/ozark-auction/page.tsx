import Link from "next/link";
import {
  ComplianceCard,
  ComplianceNav,
  CompliancePageHeader,
} from "../../components";
import { ComplianceDoThisNext, ComplianceWhatThisMeans } from "../../compliance-ux";
import {
  loadOzarkForwardAuctionDonations,
  OZARK_AUCTION_CSV_NAME,
  ozarkAuctionRowsToCsv,
} from "@/lib/compliance/in-kind/ozark-forward-auction-donations";
import { loadApprovalItems } from "@/lib/compliance/approval/approval-storage";

export const dynamic = "force-dynamic";

const IN_KIND_PHOTOS = [
  "att.EakxU1jYtX133ku7f1haPlwKIeW1uh5D0_jy_qCfwKM.jpg",
  "att.JT8KlqSSQyejhBqimYNRHyp-Nvsv2y9zWP9X0UezblE.jpg",
  "att.RABoBz2uoaeAo8ruzwIHQJClwu2hdMHjyhh1XTFt44s.jpg",
];

export default async function OzarkForwardAuctionPage() {
  const [{ rows, csvPath, fromDisk }, approvalItems] = await Promise.all([
    loadOzarkForwardAuctionDonations(),
    loadApprovalItems(),
  ]);
  const totalValue = rows.reduce((sum, r) => sum + r.estimatedValueUsd, 0);
  const photoItems = approvalItems.filter((i) => i.source === "in_kind_contribution" && i.subtitle?.startsWith("att."));
  const photosApproved = photoItems.filter((i) => i.status === "approved").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="In-kind"
        title="Ozark Forward auction donations — April 2026"
        description="Line-item inventory extracted from three April26 photos (items #1–#38). Use this for SOS in-kind reporting — not the single-photo approval queue rows."
        actions={
          <Link
            href="/admin/compliance/approval/april-2026-compliance-review?filter=in_kind"
            className="rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white"
          >
            In-kind approval queue (3 photos)
          </Link>
        }
      />
      <ComplianceNav />
      <ComplianceDoThisNext
        title="Work the spreadsheet, then sign off photos"
        description="Enter each donor/item from this table into SOS. When done, approve the three att.* images in the in-kind queue as evidence."
        href="/admin/compliance/approval/april-2026-compliance-review?filter=in_kind"
        actionLabel="Open in-kind queue"
        secondaryHref="/admin/compliance/april26"
        secondaryLabel="April26 desk"
      />
      <ComplianceCard title="Evidence sign-off (3 photos)">
        <p className="text-sm">
          Auction line items: <strong>{rows.length}</strong> rows · Evidence photos: <strong>{IN_KIND_PHOTOS.length}</strong>{" "}
          · Approved in queue: <strong>{photosApproved}</strong> / {IN_KIND_PHOTOS.length}
        </p>
        <p className="mt-2 text-sm text-slate-700">
          Workflow: enter/verify each row below in SOS, then approve the three <code className="rounded bg-slate-100 px-1">att.*</code>{" "}
          photos in the in-kind queue as evidence only.
        </p>
        <a
          href="/api/admin/compliance/audit-spreadsheet?file=docs/compliance/audit/april-2026-in-kind-auction.csv"
          className="mt-3 inline-block text-sm font-bold text-[#0f2744] underline"
        >
          Download in-kind audit CSV
        </a>
      </ComplianceCard>
      <ComplianceWhatThisMeans title="Why this page exists">
        <p>
          Each <code className="rounded bg-slate-100 px-1">att.*.jpg</code> photo lists many auction items. The approval
          workbench shows one row per <strong>photo</strong>; this page holds <strong>{rows.length} line items</strong>{" "}
          (~${totalValue} estimated value total).
        </p>
      </ComplianceWhatThisMeans>
      <ComplianceCard title="Download CSV">
        <p className="text-sm text-slate-700">
          File on disk: <span className="font-mono break-all">{csvPath}</span>
          {fromDisk ? " (present)" : " (missing — copy CSV into April26 folder)"}
        </p>
        <p className="mt-2 text-sm">
          Regenerate:{" "}
          <code className="rounded bg-slate-100 px-1">npm run compliance:export-ozark-auction-donations</code>
        </p>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(ozarkAuctionRowsToCsv(rows))}`}
          download={OZARK_AUCTION_CSV_NAME}
          className="mt-4 inline-block rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white"
        >
          Download {OZARK_AUCTION_CSV_NAME}
        </a>
      </ComplianceCard>
      {!rows.length ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          No rows loaded. Ensure <span className="font-mono">{OZARK_AUCTION_CSV_NAME}</span> exists under your April26
          folder ({csvPath}).
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-bold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Donor</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">$</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.itemNumber}-${r.donorName}-${r.itemTitle}`} className="border-b border-slate-100">
                <td className="px-3 py-2 font-mono">{r.itemNumber}</td>
                <td className="px-3 py-2">{r.donorName}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.phone || "—"}</td>
                <td className="max-w-[12rem] px-3 py-2 text-xs">{r.address || "—"}</td>
                <td className="px-3 py-2">{r.itemTitle}</td>
                <td className="px-3 py-2 font-mono">{r.estimatedValueUsd}</td>
                <td className="max-w-[14rem] px-3 py-2 text-xs text-slate-600">
                  {[r.statusNotes, r.itemDescription].filter(Boolean).join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
