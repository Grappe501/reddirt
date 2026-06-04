import type { SpeakOrderDrill } from "@/lib/intelligence/v4/sosDebateQuestionTypes";

/** Never "me too" — each position adds a distinct layer. */
export function buildSpeakOrderDrills(opts: {
  topic: string;
  firstLayer: string;
  secondLayer: string;
  thirdLayer: string;
  agreePhrase: string;
  attackPivot: string;
}): SpeakOrderDrill[] {
  const { topic, firstLayer, secondLayer, thirdLayer, agreePhrase, attackPivot } = opts;
  return [
    {
      position: 1,
      label: "Kelly speaks first",
      strategy: "Set the frame before opponents claim it. Name SOS-as-service and one concrete deliverable.",
      openingLine: `On ${topic}, here is how I would run the office differently starting day one:`,
      freshAddition: firstLayer,
      ifOthersAlreadyAgreed: "N/A — you define terms first.",
      ifOthersAttackedKelly: attackPivot,
      closingBeat: "That is the standard I will hold myself to as Secretary of State.",
    },
    {
      position: 2,
      label: "Kelly speaks second",
      strategy: `${agreePhrase} — then add what they skipped: county implementation or verified record detail.`,
      openingLine: agreePhrase,
      freshAddition: secondLayer,
      ifOthersAlreadyAgreed:
        "Do not stop at agreement. Add: 'Where we differ is who pays when Little Rock passes another election bill — counties implement, SOS should fund training.'",
      ifOthersAttackedKelly: attackPivot,
      closingBeat: "Voters deserve a Secretary of State who shows up for clerks, not just authors bills.",
    },
    {
      position: 3,
      label: "Kelly speaks third",
      strategy: "Summarize the gap in one fresh line — become the memorable closer on this topic.",
      openingLine: "I have listened to both of my opponents on this, and I agree integrity matters.",
      freshAddition: thirdLayer,
      ifOthersAlreadyAgreed:
        "Thank them for one true point, then: 'What neither of you answered is what happens Monday morning in a county clerk's office when a new act lands with no training budget.'",
      ifOthersAttackedKelly: attackPivot,
      closingBeat: "I am running to administer elections, not to perform them on television.",
    },
  ];
}
