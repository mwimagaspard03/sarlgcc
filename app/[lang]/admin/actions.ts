"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginState = { error: string } | null;

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 254 || password.length > 128) {
    return { error: "Renseignez votre e-mail et votre mot de passe." };
  }
  const supabase = await createClient();
  if (!supabase) return { error: "La connexion n'est pas configurée sur cet environnement." };

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  // même message que l'e-mail ou le mot de passe soit faux : on ne révèle pas quels comptes existent
  if (error) return { error: "E-mail ou mot de passe incorrect." };
  redirect("/fr/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/fr/admin/connexion");
}
