import { ArkansasConversationStrategyPanel } from "@/components/election-plan/ArkansasConversationStrategyPanel";

export const metadata = {
  title: "Arkansas Conversation Strategy | Election Plan",
  description: "Campaign organizing doctrine — conversations, trust, and the Power of 5 ladder.",
  robots: { index: false, follow: false },
};

export default function ConversationStrategyPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7F · Campaign Doctrine · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <ArkansasConversationStrategyPanel variant="full" />
        </div>
      </div>
    </>
  );
}
