export type CountyNetworkingContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  hasFacebook: boolean;
  referredBy: string;
  notes: string;
  createdAt: string;
};

export type CountyNetworkingContactDraft = Omit<CountyNetworkingContact, "id" | "createdAt">;
