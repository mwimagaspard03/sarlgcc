import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/supabase/auth";
import AdminNav from "../../AdminNav";
import NewVendorForm from "./NewVendorForm";

export default async function NouveauVendeurPage() {
  const ctx = await getAdminContext();
  if (ctx.state === "unconfigured") return <p className="muted">L'espace admin n'est pas configuré sur cet environnement.</p>;
  if (ctx.state === "anonymous") redirect("/fr/admin/connexion");
  if (ctx.state === "forbidden") redirect("/fr/admin"); // la page d'accueil admin affiche « Accès refusé »

  return (
    <section>
      <AdminNav role={ctx.role} />
      <h1>Nouveau vendeur</h1>
      <p className="lead">Le compte est créé avec un mot de passe provisoire, affiché une seule fois. Aucun e-mail n'est envoyé : transmettez-le au vendeur vous-même.</p>
      <NewVendorForm />
    </section>
  );
}
