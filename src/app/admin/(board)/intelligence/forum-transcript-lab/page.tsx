import Link from "next/link";
import { ForumTranscriptLabClient } from "@/components/admin/intelligence/ForumTranscriptLabClient";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { DEBATE_WEEK_INTENSIVE_HUB_HREF } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

export default function ForumTranscriptLabPage() {
  const record = loadForumTranscriptLab();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Day 4 anchor"
        title="Forum transcript lab"
        description="Upload the three-candidate forum video, transcribe with AI, and build Kelly's capitalize playbook for the SOS debate."
      >
        <V4BackLinks />
        <Link
          href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Debate week intensive
        </Link>
      </V4PageHeader>

      <ForumTranscriptLabClient initialRecord={record} openaiConfigured={isOpenAIConfigured()} />
    </div>
  );
}
