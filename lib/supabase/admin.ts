import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client à clé secrète : il CONTOURNE toutes les règles de sécurité de la base.
// À utiliser uniquement dans du code serveur, et seulement APRÈS avoir vérifié le rôle avec getAdminContext().
// La variable SUPABASE_SECRET_KEY n'a volontairement pas de préfixe NEXT_PUBLIC_ : elle ne part jamais au navigateur.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
