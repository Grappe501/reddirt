"use client";

import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { kellyFriendInviteScripts } from "@/content/resources/kelly-friend-invite-scripts";
import { siteConfig } from "@/config/site";
import { CopyToClipboardButton } from "@/components/resources/CopyToClipboardButton";
import { cn } from "@/lib/utils";

function buildCopyableText(
  s: (typeof kellyFriendInviteScripts)[number],
  baseUrl: string,
): string {
  const body = s.body.replaceAll("##SITE_URL##", baseUrl);
  if (s.channel === "email" && s.emailSubject) {
    return `Subject: ${s.emailSubject}\n\n${body}`;
  }
  return body;
}

const channelPill: Record<string, string> = {
  sms: "Text",
  email: "Email",
  phone: "Phone",
};

export function FriendInviteScriptsSection() {
  const baseUrl = siteConfig.url;

  return (
    <FullBleedSection
      id="friend-invite-scripts"
      padY
      variant="subtle"
      className="border-t border-deep-soil/8"
      aria-labelledby="friend-invite-heading"
    >
      <ContentContainer>
        <SectionHeading
          id="friend-invite-heading"
          align="left"
          eyebrow="Copy & send"
          title="Invites for friends and family (text, email, phone)"
          subtitle="These are written as if you are the one sending them—useful when someone doesn’t follow down-ballot races or even know this job is on the ballot. Tweak names and sign-offs. Tap the clipboard to copy the full block."
        />
        <ul className="mt-10 list-none space-y-8 p-0">
          {kellyFriendInviteScripts.map((s) => {
            const text = buildCopyableText(s, baseUrl);
            return (
              <li
                key={s.id}
                className="overflow-hidden rounded-card border border-deep-soil/12 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-col gap-3 border-b border-deep-soil/10 bg-deep-soil/[0.03] px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full border border-red-dirt/20 bg-red-dirt/8 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-red-dirt/95",
                        )}
                      >
                        {channelPill[s.channel] ?? s.channel}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-deep-soil sm:text-xl">{s.title}</h3>
                    </div>
                    <p className="mt-1.5 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/70">{s.blurb}</p>
                  </div>
                  <div className="flex shrink-0 items-center justify-end sm:pt-0.5">
                    <CopyToClipboardButton
                      text={text}
                      label={`Copy ${s.title} to clipboard`}
                    />
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  <pre className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-deep-soil/88 [word-break:break-word]">
                    {text}
                  </pre>
                </div>
              </li>
            );
          })}
        </ul>
      </ContentContainer>
    </FullBleedSection>
  );
}
