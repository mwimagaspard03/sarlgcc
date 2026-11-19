import type { CookieOptions } from "@supabase/ssr";

// Cookies de session durcis : illisibles par le JavaScript de la page (httpOnly), envoyés seulement en HTTPS en production,
// et jamais joints aux requêtes venant d'autres sites (sameSite lax).
// Compatible tant que le site n'utilise pas le client Supabase du navigateur (ce qui est le cas : tout passe par le serveur).
// shortcut: à revoir si un jour le navigateur doit lire la session lui-même (par exemple envoi de photos direct depuis la page).
export const hardenCookie = (options: CookieOptions): CookieOptions => ({
  ...options,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
