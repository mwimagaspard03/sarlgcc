import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Client Supabase côté serveur, lié aux cookies du visiteur (donc soumis aux règles de sécurité de la base).
// Renvoie null si les variables manquent (par exemple sur main avant le lancement) : le site ne plante pas.
export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // appelé depuis un composant serveur : le proxy se charge de rafraîchir la session
        }
      },
    },
  });
}
