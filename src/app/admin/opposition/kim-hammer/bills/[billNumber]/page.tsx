import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ billNumber: string }>;
};

export default async function AdminOppositionKimHammerBillRedirectPage({ params }: Props) {
  const { billNumber } = await params;
  redirect(`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(billNumber)}`);
}

