import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import {
  assertCanvassingIssue,
  CanvassingIssueContent,
} from "@/components/volunteer/canvassing/CanvassingIssueContent";
import { CanvassingClipboardSheet } from "@/components/volunteer/canvassing/CanvassingClipboardSheet";
import { CANVASSING_CLIPBOARD, CANVASSING_ISSUES, getCanvassingIssue } from "@/content/volunteer/canvassing";
import { pageMeta } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ issueSlug: string }>;
};

export function generateStaticParams() {
  return CANVASSING_ISSUES.map((issue) => ({ issueSlug: issue.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { issueSlug } = await params;
  const issue = getCanvassingIssue(issueSlug);
  if (!issue) {
    return pageMeta({
      title: "Canvassing issue",
      description: "Canvassing training",
      path: `/volunteer/resources/canvassing/${issueSlug}`,
    });
  }
  return pageMeta({
    title: `Canvassing · ${issue.label}`,
    description: issue.kellyStance.slice(0, 155),
    path: `/volunteer/resources/canvassing/${issue.slug}`,
  });
}

export default async function CanvassingIssuePage({ params }: Props) {
  const { issueSlug } = await params;
  const issue = assertCanvassingIssue(issueSlug, getCanvassingIssue(issueSlug));
  return <CanvassingIssueContent issue={issue} />;
}
