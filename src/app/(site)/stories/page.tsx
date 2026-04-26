import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { StorySubmissionForm } from "@/components/forms/StorySubmissionForm";
import { StoriesHub } from "@/components/content/StoriesHub";
import { pageMeta } from "@/lib/seo/metadata";
import { featuredPublicStories, listPublicStoriesMerged } from "@/lib/content/public-catalog";
import { listPublicSubstackPosts } from "@/lib/integrations/substack/list-public-posts";

export const metadata: Metadata = pageMeta({
  title: "Stories",
  description:
    "Arkansas voices on voting, organizing, and community—real stories grounded in civic life, not national-issue clutter.",
  path: "/stories",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default async function StoriesPage() {
  const stories = await listPublicStoriesMerged();
  let substackPosts: Awaited<ReturnType<typeof listPublicSubstackPosts>> = [];
  try {
    substackPosts = await listPublicSubstackPosts();
  } catch (err) {
    console.error("[stories] Substack notebook feed failed:", err);
  }
  const featured = substackPosts.length > 0 ? [] : await featuredPublicStories(2);

  return (
    <>
      <PageHero
        eyebrow="Voices"
        title="Stories from the ground"
        subtitle="These aren’t messaging tests—they’re neighbors naming what happened, what hurt, and what they’re building anyway. Read slowly. Then pass the link to someone who thinks they’re alone in it."
      />

      <FullBleedSection variant="subtle" padY aria-labelledby="stories-archive-heading">
        <ContentContainer wide>
          <SectionHeading
            id="stories-archive-heading"
            align="left"
            eyebrow="Archive"
            title="Kelly’s writing on Substack, then Arkansas voices on this site"
            subtitle="The top section pulls recent posts from Kelly’s Substack (full articles open there). Below, you can filter stories published here—neighbor voices, not talking points."
          />
          <StoriesHub stories={stories} featured={featured} substackPosts={substackPosts} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="share" aria-labelledby="share-heading">
        <ContentContainer>
          <SectionHeading
            id="share-heading"
            eyebrow="Share"
            title="Add your story to the record"
            subtitle="Plain language, no jargon. We follow up before anything is shared publicly—and we never treat your life like a campaign prop."
          />
          <div className="mt-10 max-w-3xl">
            <StorySubmissionForm />
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
