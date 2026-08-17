import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";
import { getCampaignBlogUrl, getContactMailto } from "@/config/external-campaign";
import { PRIVACY_POLICY_EFFECTIVE, privacyPolicyCopy } from "@/content/website/privacy-policy";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description:
    "How The Committee to Elect Kelly Grappe handles information you share on the campaign website — forms, contact, donations, and your choices.",
  path: "/privacy",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const mailHref = getContactMailto();
  const mailLabel = mailHref.replace(/^mailto:/i, "");
  const { hero, intro } = privacyPolicyCopy;

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        contentClassName="!pt-6 !pb-8 sm:!pt-8 sm:!pb-10"
      />
      <FullBleedSection padY className="!py-10 sm:!py-14">
        <ContentContainer className="max-w-prose space-y-10 font-body text-base leading-relaxed text-kelly-text/85">
          <p className="text-sm text-kelly-text/70">Effective {PRIVACY_POLICY_EFFECTIVE}.</p>

          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}

          <Section id="who" title="Who is responsible">
            <p>
              The Committee to Elect Kelly Grappe operates this website. {CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine}.
            </p>
            <p>
              Questions about this policy:{" "}
              <a className="font-semibold text-kelly-navy underline" href={mailHref}>
                {mailLabel}
              </a>{" "}
              or{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/contact">
                Contact
              </Link>
              .
            </p>
          </Section>

          <Section id="what-you-give" title="Information you give us">
            <p>When you use a form on this site, you may provide:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Name, email, phone, city, ZIP, and county</li>
              <li>How you want to help — volunteer, host, stay connected, start a local team, or invite Kelly</li>
              <li>Availability, skills, language preference, and notes you choose to write</li>
              <li>A personal story, if you submit one, and whether we may follow up about publishing it</li>
              <li>Website feedback, if you use the optional site-help tools</li>
            </ul>
            <p>
              Please do not send Social Security numbers, bank account numbers, passwords, or medical details through
              these forms. If a message looks automated or abusive, we may discard it.
            </p>
          </Section>

          <Section id="automatic" title="Information collected automatically">
            <p>
              Like most websites, our host may log technical details such as browser type, approximate location from IP
              address, pages requested, and time of the request. We use that to keep the site running and to fix
              problems.
            </p>
            <p>
              This site also records simple campaign analytics — for example that a page was viewed or that a form was
              started or finished. Those events use a random session id stored in your browser. They are for campaign
              operations, not for selling profiles.
            </p>
          </Section>

          <Section id="use" title="How we use information">
            <p>We use information you share to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Follow up about volunteering, hosting, events, and staying connected</li>
              <li>Match people to counties, languages, and roles they asked for</li>
              <li>Plan campaign travel and public events</li>
              <li>Answer questions and improve the website</li>
              <li>Comply with campaign-finance and recordkeeping rules that apply to us</li>
            </ul>
            <p>
              Signing up for yourself does not enroll your friends. Power of 5 is a conversation you choose to have
              with people you already know. Their information enters our volunteer system only if they sign up.
            </p>
          </Section>

          <Section id="share" title="How we share information">
            <p>We do not sell your information.</p>
            <p>We may share it with:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Campaign staff and trained volunteers who need it to do the work you asked for</li>
              <li>Service providers who host this site, send email, process forms, or keep records — under our direction</li>
              <li>Authorities if the law requires it, or to protect people from harm or fraud</li>
            </ul>
            <p>
              Form submissions are reviewed by the campaign. They are not posted automatically on the public website.
              If you send a story and agree that we may follow up about publishing, we will not publish it without that
              review.
            </p>
          </Section>

          <Section id="elsewhere" title="Pages and tools that are not us">
            <p>Some buttons leave this campaign site. Those services have their own policies:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Donate</strong> goes to GoodChange, our contribution processor.{" "}
                <Link className="font-semibold text-kelly-navy underline" href="/donate">
                  Donate
                </Link>{" "}
                explains the handoff. Use GoodChange’s notices for payment details.
              </li>
              <li>
                <strong>Check registration</strong> goes to Arkansas VoterView, the official state lookup — not a campaign
                database.
              </li>
              <li>
                <strong>Videos</strong> may play through YouTube. YouTube may set its own cookies if you press play.
              </li>
              <li>
                <strong>Kelly’s Substack</strong> is{" "}
                <a
                  className="font-semibold text-kelly-navy underline"
                  href={getCampaignBlogUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  kellygrappesos.substack.com
                </a>
                . Subscribe there under Substack’s terms.
              </li>
            </ul>
          </Section>

          <Section id="cookies" title="Cookies and similar storage">
            <p>
              We use cookies or similar storage when needed to run the site — for example to keep a volunteer or staff
              sign-in, to remember that you dismissed a homepage prompt, or to keep the analytics session id described
              above. You can clear cookies and site data in your browser. Some features will not work without them.
            </p>
          </Section>

          <Section id="keep" title="How long we keep it">
            <p>
              We keep campaign contact and volunteer records for as long as they are needed to run this campaign and to
              meet recordkeeping rules. We then delete or archive them according to those rules. Technical logs are kept
              for a shorter operational period.
            </p>
          </Section>

          <Section id="choices" title="Your choices">
            <p>
              Email{" "}
              <a className="font-semibold text-kelly-navy underline" href={mailHref}>
                {mailLabel}
              </a>{" "}
              to update your information, ask us to stop campaign email or texts you opted into, or ask what we have
              from a form you submitted. Use the same address you used on the form so we can find the right record.
            </p>
            <p>
              You can also use{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/get-involved">
                Get Involved
              </Link>{" "}
              or{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/contact">
                Contact
              </Link>
              . Stopping campaign messages does not delete records we must keep for compliance.
            </p>
          </Section>

          <Section id="children" title="Children">
            <p>
              This is a political campaign website. It is not directed at children under 13, and we do not knowingly
              collect personal information from them through these forms.
            </p>
          </Section>

          <Section id="security" title="Security">
            <p>
              We use standard hosting and access controls. No website is perfectly secure. Do not send secrets or
              payment card numbers through campaign forms.
            </p>
          </Section>

          <Section id="organizing" title="Organizing tools">
            <p>
              Volunteer dashboards and county tools, when you are given access, are for campaign work — not for browsing
              other people’s private details. Public pages show community-level information, not household voter-file
              maps. More on how we expect organizers to treat people is on{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/privacy-and-trust">
                Privacy and trust
              </Link>
              .
            </p>
          </Section>

          <Section id="changes" title="Updates">
            <p>
              If this policy changes, we will post the new version here and update the effective date at the top of the
              page.
            </p>
          </Section>

          <Section id="not-advice" title="Not legal advice">
            <p>
              This page explains how the campaign website handles information. It is not legal advice. Official voter
              registration, election rules, and government records are handled by the{" "}
              <a
                className="font-semibold text-kelly-navy underline"
                href="https://www.sos.arkansas.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Arkansas Secretary of State
              </a>{" "}
              and county clerks — not by this campaign site.
            </p>
          </Section>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
