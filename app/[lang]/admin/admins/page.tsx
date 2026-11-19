import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/supabase/auth";
import AdminNav from "../AdminNav";
import { removeAdmin } from "../actions-gestion";
import NewAdminForm from "./NewAdminForm";

type Row = { id: string; role: "owner" | "admin"; full_name: string | null };

export default async function AdminsPage() {
  const ctx = await getAdminContext();
  if (ctx.state === "unconfigured") return <p className="muted">L'espace admin n'est pas configuré sur cet environnement.</p>;
  if (ctx.state === "anonymous") redirect("/fr/admin/connexion");
  if (ctx.state === "forbidden") redirect("/fr/admin"); // la page d'accueil admin affiche « Accès refusé »
  if (ctx.role !== "owner") {
    return (
      <section>
        <AdminNav role={ctx.role} />
        <h1>Admins</h1>
        <p className="lead">Cette page est réservée au propriétaire.</p>
      </section>
    );
  }

  const { data, error } = await ctx.supabase.from("profiles").select("id, role, full_name").in("role", ["owner", "admin"]).order("created_at");
  const rows = (data ?? []) as Row[];

  // les adresses e-mail sont dans les comptes de connexion : lecture avec la clé secrète, après vérification du rôle
  const admin = createAdminClient();
  const emails = new Map<string, string>();
  if (admin) {
    await Promise.all(
      rows.map(async (r) => {
        const { data: u } = await admin.auth.admin.getUserById(r.id);
        if (u?.user?.email) emails.set(r.id, u.user.email);
      }),
    );
  }

  return (
    <section>
      <AdminNav role={ctx.role} />
      <h1>Admins</h1>
      <p className="lead">Un admin voit les devis et gère les vendeurs, mais ne peut ni ajouter ni retirer d'admin.</p>

      {error ? (
        <p className="admin-error">Impossible de charger les admins.</p>
      ) : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-card">
              <p>
                <span className="admin-badge">{r.role === "owner" ? "Propriétaire" : "Admin"}</span>
              </p>
              <p>
                <strong>{r.full_name ?? "Sans nom"}</strong> · {emails.get(r.id) ?? "e-mail indisponible"}
              </p>
              {r.role === "admin" && (
                <div className="admin-actions">
                  <form action={removeAdmin}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="btn btn-outline btn-small">
                      Retirer cet admin
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2>Ajouter un admin</h2>
      <NewAdminForm />
    </section>
  );
}
