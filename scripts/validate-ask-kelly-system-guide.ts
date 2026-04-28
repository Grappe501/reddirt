/**
 * Sanity-check system-guide intents (no test runner). Run from repo root:
 *   npm run check:ask-kelly-guide
 */
import { answerAskKellySystemGuide } from "../src/lib/ask-kelly/ask-kelly-system-guide";

const MUST_MATCH: string[] = [
  "Where do I update the website?",
  "Where do I change copy?",
  "How do I edit this page?",
  "Where is the dashboard?",
  "Where is candidate onboarding?",
  "Show me beta feedback.",
  "What did people submit?",
  "Who decides what goes live?",
  "Can staff change the website?",
  "What does send to database mean?",
  "What happens if the save fails?",
  "What if I lose connection?",
  "How do I recover a draft?",
  "Can you read this to me?",
  "Why is voice unavailable?",
  "Who has final say?",
  "Help me rewrite this section.",
  "Can I talk to the system?",
  "Read this aloud.",
  "Take me to where I update website copy.",
  "What should I check before publishing?",
  "What is Dixie?",
  "How does the Dixie voice portal work?",
  "How do I talk to Ask Kelly?",
  "Can Dixie publish changes?",
  "Why should I use Ask Kelly instead of ChatGPT?",
  "What is the candidate console?",
  "What is the campaign manager console?",
  "Can Ask Kelly use my campaign materials?",
  "Can Ask Kelly help me write like me?",
  "What is safe access?",
  "Can Ask Kelly search the internet?",
  "Can Ask Kelly search the database?",
  "Can Ask Kelly build reports?",
  "What are research tools?",
  "Can I minimize the console?",
  "Can I make this full screen?",
  "How do I keep this open while working?",
  "Where are social media stats?",
  "How do I send an email?",
  "How do I send a text?",
  "How do I message one person?",
  "Where is Discord?",
  "Where is the Campaign Organizing Hub?",
  "Where are the county briefings?",
  "Where is the volunteer page?",
  "Open countyWorkbench",
  "Where is distipope briefing?",
  "Where is volunteerPage?",
  "How do I communicate with supporters?",
  "Can I send a mass message?",
];

/** Meta / orientation phrases (must match keyword guide). */
const MUST_META: string[] = ["What can I ask?", "Help", "What do you do?"];

const CONTEXT_SAMPLES: { pathname: string; message: string }[] = [
  { pathname: "/admin/pages/what-we-believe", message: "What can I do here?" },
  { pathname: "/admin/workbench/ask-kelly-beta", message: "What did people submit?" },
  { pathname: "/admin/ask-kelly", message: "Where do I go next?" },
];

function main(): void {
  let failed = false;
  for (const q of MUST_MATCH) {
    const r = answerAskKellySystemGuide(q);
    if (!r.matched) {
      console.error("[ask-kelly-system-guide] No match for:", JSON.stringify(q));
      failed = true;
    }
  }
  for (const { pathname, message } of CONTEXT_SAMPLES) {
    const r = answerAskKellySystemGuide(message, { pathname });
    if (!r.matched) {
      console.error(
        "[ask-kelly-system-guide] No match with pathname:",
        JSON.stringify(pathname),
        JSON.stringify(message),
      );
      failed = true;
    }
  }
  for (const q of MUST_META) {
    const r = answerAskKellySystemGuide(q);
    if (!r.matched) {
      console.error("[ask-kelly-system-guide] No match for meta phrase:", JSON.stringify(q));
      failed = true;
    }
  }
  if (failed) {
    process.exit(1);
  }
  console.log(
    `[ask-kelly-system-guide] OK: ${MUST_MATCH.length} global + ${MUST_META.length} meta phrases + ${CONTEXT_SAMPLES.length} pathname samples.`,
  );
}

main();
