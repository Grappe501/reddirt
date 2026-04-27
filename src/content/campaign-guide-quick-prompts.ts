/** Short starter questions for Ask Kelly — answered via /api/assistant (RAG + OpenAI; key stays server-side). */
export const CAMPAIGN_GUIDE_QUICK_PROMPTS: { label: string; message: string }[] = [
  {
    label: "What does the SoS office do?",
    message:
      "In plain language, what does Arkansas’s Secretary of State do for voters, businesses, and county election officials?",
  },
  {
    label: "Kelly’s priorities",
    message: "What are Kelly Grappe’s top priorities if she is elected Secretary of State?",
  },
  {
    label: "Register to vote",
    message: "How do I register to vote in Arkansas, and where is the official state lookup?",
  },
  {
    label: "Ballot initiatives",
    message: "How do ballot initiatives and referenda work in Arkansas, and how does the Secretary of State fit in?",
  },
];
