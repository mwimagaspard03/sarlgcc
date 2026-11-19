"use server";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/supabase/auth";

// Chaque action commence par vérifier le rôle : le proxy seul ne protège pas les actions serveur.
// Les changements de statut passent par la session de l'admin (les règles de la base s'appliquent aussi).
// La clé secrète n'est utilisée que pour créer ou supprimer des comptes de connexion.

// shortcut: les erreurs des changements de statut sont ignorées (la page se recharge simplement) ; afficher un message si cela devient gênant.

type CreateResult = { error?: string; created?: { email: string; password: string; label: string } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9 ]{5,29}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // sans 0, O, 1, l, I : plus facile à recopier
const newPassword = () => Array.from({ length: 14 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const text = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

async function requireAdmin() {
  const ctx = await getAdminContext();
  return ctx.state === "ok" ? ctx : null;
}
async function requireOwner() {
  const ctx = await requireAdmin();
  return ctx && ctx.role === "owner" ? ctx : null;
}

// Crée le compte de connexion (confirmé d'office, aucun e-mail envoyé) avec un mot de passe provisoire.
async function createAuthUser(email: string) {
  const admin = createAdminClient();
  if (!admin) return { error: "La clé secrète n'est pas configurée sur cet environnement." };
  const password = newPassword();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) return { error: "Impossible de créer le compte (adresse e-mail déjà utilisée ?)." };
  return { admin, id: data.user.id, password };
}

export async function createVendor(_prev: CreateResult | null, formData: FormData): Promise<CreateResult> {
  if (!(await requireAdmin())) return { error: "Accès refusé." };

  const business = text(formData.get("business_name"), 120);
  const city = text(formData.get("city"), 80);
  const description = text(formData.get("description"), 1000);
  const whatsapp = text(formData.get("whatsapp"), 30);
  const email = text(formData.get("email"), 254).toLowerCase();
  if (business.length < 2 || business.length > 120 || city.length < 2 || city.length > 80 || description.length > 1000 || !PHONE.test(whatsapp) || !EMAIL.test(email) || email.length > 254) {
    return { error: "Vérifiez les champs : nom, ville, numéro WhatsApp (chiffres, + au début si international) et e-mail valides." };
  }

  const acc = await createAuthUser(email);
  if ("error" in acc) return { error: acc.error };
  const { admin, id, password } = acc;

  let vendorId: string | null = null;
  // si une étape échoue, on défait tout : aucun compte à moitié créé
  const fail = async (): Promise<CreateResult> => {
    if (vendorId) await admin.from("vendors").delete().eq("id", vendorId);
    await admin.auth.admin.deleteUser(id);
    return { error: "La création a échoué, rien n'a été enregistré. Réessayez." };
  };

  const p = await admin.from("profiles").insert({ id, role: "vendor", full_name: business });
  if (p.error) return fail();
  const v = await admin.from("vendors").insert({ owner_id: id, business_name: business, city, description: description || null }).select("id").single();
  if (v.error || !v.data) return fail();
  vendorId = v.data.id as string;
  const c = await admin.from("vendor_contacts").insert({ vendor_id: vendorId, whatsapp });
  if (c.error) return fail();

  revalidatePath("/fr/admin/vendeurs");
  return { created: { email, password, label: business } };
}

export async function createAdmin(_prev: CreateResult | null, formData: FormData): Promise<CreateResult> {
  if (!(await requireOwner())) return { error: "Réservé au propriétaire." };

  const name = text(formData.get("full_name"), 100);
  const email = text(formData.get("email"), 254).toLowerCase();
  if (name.length < 2 || name.length > 100 || !EMAIL.test(email) || email.length > 254) {
    return { error: "Vérifiez le nom et l'adresse e-mail." };
  }

  const acc = await createAuthUser(email);
  if ("error" in acc) return { error: acc.error };
  const { admin, id, password } = acc;

  const p = await admin.from("profiles").insert({ id, role: "admin", full_name: name });
  if (p.error) {
    await admin.auth.admin.deleteUser(id);
    return { error: "La création a échoué, rien n'a été enregistré. Réessayez." };
  }
  revalidatePath("/fr/admin/admins");
  return { created: { email, password, label: name } };
}

// Retire un admin (jamais le propriétaire) : supprime son compte, son profil part avec.
export async function removeAdmin(formData: FormData): Promise<void> {
  const ctx = await requireOwner();
  const id = formData.get("id");
  if (!ctx || typeof id !== "string" || !UUID.test(id)) return;
  const { data: target } = await ctx.supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  if (target?.role !== "admin") return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/fr/admin/admins");
}

export async function setVendorStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!ctx || typeof id !== "string" || !UUID.test(id) || (status !== "approved" && status !== "suspended")) return;
  await ctx.supabase.from("vendors").update({ status }).eq("id", id);
  revalidatePath("/fr/admin/vendeurs");
}

export async function setQuoteStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!ctx || typeof id !== "string" || !UUID.test(id) || (status !== "new" && status !== "forwarded" && status !== "closed")) return;
  await ctx.supabase.from("quote_requests").update({ status }).eq("id", id);
  revalidatePath("/fr/admin");
}

export async function setRequestStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (!ctx || typeof id !== "string" || !UUID.test(id) || (status !== "new" && status !== "created" && status !== "rejected")) return;
  await ctx.supabase.from("vendor_requests").update({ status }).eq("id", id);
  revalidatePath("/fr/admin");
}
