// FICHIER INACTIF tant qu'il ne s'appelle pas proxy.ts (Next.js 16 ne lit que proxy.ts à la racine).
// - Si le dépôt n'a PAS de proxy.ts ni de middleware.ts : renommer ce fichier en proxy.ts.
// - S'il en existe déjà un (ex. redirection / vers /fr) : ne pas le remplacer. Y ajouter, tout au début de la fonction :
//     if (request.nextUrl.pathname.startsWith("/fr/admin")) return updateSession(request);
//   avec : import { updateSession } from "@/lib/supabase/proxy";
//   et vérifier que son matcher laisse passer /fr/admin/:path*.
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = { matcher: ["/fr/admin/:path*"] };
