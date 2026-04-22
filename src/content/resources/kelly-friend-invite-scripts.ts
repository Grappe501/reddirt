/**
 * Friend-to-friend invite copy for the talking-about-kelly page.
 * Placeholder ##SITE_URL## is replaced at render (see FriendInviteScriptsSection).
 */
export type FriendInviteChannel = "sms" | "email" | "phone";

export type KellyFriendInviteScript = {
  id: string;
  channel: FriendInviteChannel;
  title: string;
  blurb: string;
  /** Plain text. Use ##SITE_URL## for the public site base URL (no trailing slash in placeholder expansion). */
  body: string;
  /** Set for email: separate subject line. */
  emailSubject?: string;
};

export const kellyFriendInviteScripts: KellyFriendInviteScript[] = [
  {
    id: "sms-friend-1",
    channel: "sms",
    title: "Text (SMS)",
    blurb: "Short—good when they might not know this race exists. Tweak the greeting to match how you text each other.",
    body: `Hey—random ask. I'm learning about a race here in AR that actually affects everyday stuff: Secretary of State (elections info, public records for businesses, that kind of thing). A woman named Kelly Grappe is running. I'm not trying to start a long political thread—just thought you'd want the name if you ever look. Her site: ##SITE_URL##
If you want a plain story first: ##SITE_URL##/about
Love you / thanks for humoring me.`,
  },
  {
    id: "email-friend-1",
    channel: "email",
    title: "Email",
    blurb: "A little room for context if they are completely new to down-ballot races. Paste into your email app; add your own sign-off.",
    emailSubject: "Something on my mind — a race that affects all of us in Arkansas (not a long rant)",
    body: `Hi —

I'm writing you as a friend, not to debate the whole world on a Tuesday.

You might not have this race on your radar yet, so here's the one-line version: Arkansas elects a Secretary of State, and that job keeps election information and a lot of public business filings from turning into a mess. It doesn't get the TV time that other offices get, but it touches everyone who votes or has a business.

I'm trying to get smarter about a candidate named Kelly Grappe. She's running on fair process, clear information, and serving all 75 counties—basically, making that office do its job with dignity. Whether or not you end up agreeing, I wanted you to have a place to read in your own time:

Campaign site (overview):
##SITE_URL##

About Kelly (her path and why this office):
##SITE_URL##/about

What she wants to do in the role:
##SITE_URL##/priorities

No pressure to reply with your vote—I'm just being the friend who says "this one matters for how the rules feel where we live."

[Your name]`,
  },
  {
    id: "phone-bank-1",
    channel: "phone",
    title: "Phone (call a friend or script for small phone-bank huddles)",
    blurb: "Read naturally; pauses are written in. If they know nothing, stay in education mode—no pressure for a commitment on the call.",
    body: `OPENING
"Hi, it's [your name]—do you have about two minutes, or is this a bad time?"

IF BAD TIME: "No problem—text me a better window. Thanks."

IF OK:
"I'm calling as a friend. I know a lot of us haven't thought much about the Secretary of State race, so I wanted to share a name in case you want to look later—Kelly Grappe. It's the office that runs a lot of election information and public business records in Arkansas, not a Washington job. I'm not trying to debate the whole country—just to put a serious person on your radar."

IF THEY KNOW NOTHING ABOUT THE RACE:
"Totally fair—this one doesn't get ads like governor. The short version: it's about fair administration—clear voter information, trustworthy handling of the public record, and a front office that works for every county, not just the loud corners."

"Her website is ##SITE_URL## and there's an about page at ##SITE_URL##/about if you want the story. I'm happy to text you the link too."

IF THEY ASK PARTY / PRESIDENT / NATIONAL:
"I hear you. This office isn't about that. It's about who runs the machinery of elections and filings here at home. Kelly's asking to do that job well."

IF THEY'RE SKEPTICAL OF ALL POLITICS:
"Same. I'm not asking you to trust a slogan. I'm asking you to read one bio when you have ten minutes. If it doesn't sit right, we can talk."

CLOSE
"I appreciate you listening. If you look, let me know what you think sometime—no quiz."

"Thanks—love you / take care / talk soon." (pick what fits)`,
  },
];
