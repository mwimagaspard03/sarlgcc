import { createClient } from "./server";

// Qui est connecté, et a-t-il le droit d'entrer dans l'espace admin ?
// À appeler au début de CHAQUE page ou action admin : le proxy seul ne protège pas les actions serveur.
// getClaims vérifie la signature du jeton ; on ne se fie jamais à getSession côté serveur.
export async function getAdminContext() {
  const supabase = await createClient();
  if (!supabase) return { state: "unconfigured" as const };

  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) return { state: "anonymous" as const };

  // la lecture passe par les règles de la base : un non-admin ne verrait de toute façon que sa propre ligne
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
  const role = profile?.role;
  if (role !== "owner" && role !== "admin") return { state: "forbidden" as const };

  return { state: "ok" as const, supabase, role: role as "owner" | "admin" };
}
