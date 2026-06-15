import { MeetingDetailPagePanel } from "@/components/election-plan/Phase187EMeetingPanels";
import { getMeetingAccountability } from "@/lib/election-plan/load-meeting-accountability";

type Props = {
  params: Promise<{ meetingId: string }>;
};

export async function generateStaticParams() {
  return getMeetingAccountability().meetings.map((m) => ({ meetingId: m.id }));
}

export async function generateMetadata({ params }: Props) {
  const { meetingId } = await params;
  const meeting = getMeetingAccountability().meetings.find((m) => m.id === meetingId);
  return {
    title: meeting ? `${meeting.title} | Meetings` : "Meeting | Election Plan",
    robots: { index: false, follow: false },
  };
}

export default async function MeetingDetailPage({ params }: Props) {
  const { meetingId } = await params;
  return (
    <>
      <div className="ep-classification">Phase 18.7E · Meeting rhythm · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <MeetingDetailPagePanel meetingId={meetingId} />
        </div>
      </div>
    </>
  );
}
