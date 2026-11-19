import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hardenCookie } from "./cookies";
import { getSupabaseEnv } from "./env";

// Rafraîchit la session Supabase (jeton dans les cookies) à chaque requête de l'espace admin,
// pose des en-têtes de sécurité sur ces pages et durcit les cookies de session.
// Important : aucun code entre createServerClient et getClaims, sinon les utilisateurs sont déconnectés au hasard.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();

  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, hardenCookie(options)));
        },
      },
    });
    await supabase.auth.getClaims(); // vérifie la signature du jeton et le rafraîchit si besoin
  }

  // en-têtes de sécurité de l'espace admin
  response.headers.set("X-Robots-Tag", "noindex, nofollow"); // pas d'indexation
  response.headers.set("X-Frame-Options", "DENY"); // interdit l'affichage dans un cadre (clickjacking)
  response.headers.set("X-Content-Type-Options", "nosniff"); // le navigateur ne devine pas le type des fichiers
  response.headers.set("Referrer-Policy", "same-origin"); // aucune adresse de l'admin envoyée à d'autres sites
  response.headers.set("Cache-Control", "no-store"); // pas de mise en cache (ex. mot de passe provisoire affiché)
  return response;
}
