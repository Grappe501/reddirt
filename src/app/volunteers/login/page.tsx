import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function VolunteersLegacyLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = sp.next ? `?next=${encodeURIComponent(sp.next)}` : "";
  const err = sp.error ? `${next ? "&" : "?"}error=${sp.error}` : "";
  redirect(`/election-plan/operators/leaders/sign-in${next}${err}`);
}
