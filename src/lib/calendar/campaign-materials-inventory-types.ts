export type CampaignMaterialInventoryItem = {
  label: string;
  unit: string;
  onHand: number | null;
  onHandKnown?: boolean;
  defaultPerTableEvent: number;
  notes?: string;
};

export type CampaignMaterialsInventory = {
  version: 1;
  generatedAt: string;
  notes: string[];
  items: Record<string, CampaignMaterialInventoryItem>;
};
