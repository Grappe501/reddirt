import type { CampaignMaterialsInventory } from "@/lib/calendar/campaign-materials-inventory-types";

export function buildDefaultCampaignMaterialsInventory(generatedAt = new Date().toISOString()): CampaignMaterialsInventory {
  return {
    version: 1,
    generatedAt,
    notes: [
      "Known inventory: 2 total 4 ft tablecloths.",
      "Known inventory: 2 additional pull-up banners purchased.",
      "Branded mints added; on-hand quantity is unknown.",
      "Inventory is staged for staff planning only and does not trigger purchasing or outbound messages.",
    ],
    items: {
      push_cards: { label: "Push cards", unit: "cards", onHand: null, onHandKnown: false, defaultPerTableEvent: 250 },
      fans: { label: "Fans", unit: "fans", onHand: null, onHandKnown: false, defaultPerTableEvent: 250 },
      branded_mints: { label: "Branded mints", unit: "pieces", onHand: null, onHandKnown: false, defaultPerTableEvent: 150 },
      four_foot_tablecloths: { label: "4 ft tablecloths", unit: "cloths", onHand: 2, onHandKnown: true, defaultPerTableEvent: 1 },
      pull_up_banners: { label: "Pull-up banners", unit: "banners", onHand: 2, onHandKnown: true, defaultPerTableEvent: 1 },
      kelly_shirts: { label: "Kelly shirts", unit: "shirts", onHand: null, onHandKnown: false, defaultPerTableEvent: 4, notes: "Based on volunteer count." },
      signup_sheets: { label: "Signup sheets", unit: "sheets", onHand: null, onHandKnown: false, defaultPerTableEvent: 5 },
      clipboards: { label: "Clipboards", unit: "clipboards", onHand: null, onHandKnown: false, defaultPerTableEvent: 2 },
      pens: { label: "Pens", unit: "pens", onHand: null, onHandKnown: false, defaultPerTableEvent: 10 },
      qr_code_cards: { label: "QR code cards", unit: "cards", onHand: null, onHandKnown: false, defaultPerTableEvent: 50 },
    },
  };
}
