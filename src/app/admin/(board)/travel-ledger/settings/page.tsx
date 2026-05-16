import { StorageModeBadge, TravelLedgerCard, TravelLedgerNav, TravelLedgerPageHeader } from "../components";
import { getTravelLedgerStorageStatus, loadTravelLedgerSettings } from "@/lib/travel-ledger/storage";

export const dynamic = "force-dynamic";

export default async function TravelLedgerSettingsPage() {
  const [storage, settings] = await Promise.all([getTravelLedgerStorageStatus(), loadTravelLedgerSettings()]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TravelLedgerPageHeader
        eyebrow="Settings"
        title="Travel ledger configuration"
        description="Server-side environment and reimbursement settings. Secret values are never shown in the browser."
      />
      <TravelLedgerNav />
      <StorageModeBadge mode={storage.mode} />
      <section className="grid gap-4 md:grid-cols-2">
        <TravelLedgerCard eyebrow="OpenAI configured" title={process.env.OPENAI_API_KEY ? "Yes" : "No"}>
          OpenAI calls must stay server-side. The current integration does not expose the key or depend on AI to complete manual review.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Google Maps configured" title={process.env.GOOGLE_MAPS_API_KEY ? "Yes" : "No"}>
          City mileage uses Google Maps when configured and safe built-in estimates when not configured.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="ElevenLabs configured" title={process.env.ELEVENLABS_API_KEY ? "Yes" : "No"}>
          Voice controls are optional. Manual workflow does not depend on voice.
        </TravelLedgerCard>
        <TravelLedgerCard eyebrow="Mileage rate" title={`$${settings.mileageRate.toFixed(2)}/mile`}>
          {settings.rateLabel}, effective {settings.effectiveDate}. Payee: {settings.payeeName}. Bill to: {settings.billToName}.
        </TravelLedgerCard>
      </section>
      <TravelLedgerCard eyebrow="Required env names" title="Netlify / RedDirt root env">
        <p>OPENAI_API_KEY, GOOGLE_MAPS_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID, DATABASE_URL, DIRECT_URL.</p>
      </TravelLedgerCard>
    </div>
  );
}
