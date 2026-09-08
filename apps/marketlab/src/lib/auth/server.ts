import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getEnv() {
  const url = process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_MARKETLAB_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("MarketLab Supabase auth env is not configured");
  }
  return { url, key };
}

export async function createMarketLabSupabaseServerClient() {
  const { url, key } = getEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies; route actions handle refresh writes.
        }
      },
    },
  });
}

export async function getMarketLabUser() {
  const supabase = await createMarketLabSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireMarketLabUser() {
  const user = await getMarketLabUser();
  if (!user) redirect("/login");
  return user;
}
