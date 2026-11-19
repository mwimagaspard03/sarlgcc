import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/supabase/auth";
import AdminNav from "../AdminNav";
import StatusForm from "../StatusForm";
import { setVendorStatus } from "../actions-gestion";

type Vendor = {
  id: string;
  business_name: string;
  city: string;
  status: "approved" | "suspended";
  created_at: string;
  vendor_contacts: { whatsapp: string } | { whatsapp: string }[] | null;
};

const OPTIONS = { approved: "Réactiver", suspended: "Suspendre" };
const LABEL = { approved: "Actif", suspended: "Suspendu" } as const;

export default async function VendeursPage() {
  const ctx = await getAdminContext();
  if (ctx.state === "unconfigured") return <p className="muted">L'espace admin n'est pas configuré sur cet environnement.</p>;
  if (ctx.state === "anonymous") redirect("/fr/admin/connexion");
  if (ctx.state === "forbidden") redirect("/fr/admin"); // la page d'accueil admin affiche « Accès refusé »

  const { data, error } = await ctx.supabase
    .from("vendors")
    .select("id, business_name, city, status, created_at, vendor_contacts(whatsapp)")
    .order("created_at", { ascending: false })
    .limit(100); // shortcut: 100 vendeurs maximum sans pagination, largement au-dessus de l'objectif de 10 au lancement
  const vendors = (data ?? []) as unknown as Vendor[];

  return (
    <section>
      <AdminNav role={ctx.role} />
      <div className="admin-bar">
        <h1>Vendeurs</h1>
        <Link className="btn" href="/fr/admin/vendeurs/nouveau">
          Nouveau vendeur
        </Link>
      </div>

      {error ? (
        <p className="admin-error">Impossible de charger les vendeurs.</p>
      ) : vendors.length === 0 ? (
        <p className="muted">Aucun vendeur pour le moment.</p>
      ) : (
        <ul className="admin-list">
          {vendors.map((v) => {
            const contact = Array.isArray(v.vendor_contacts) ? v.vendor_contacts[0] : v.vendor_contacts;
            return (
              <li key={v.id} className="admin-card">
                <p>
                  <span className="admin-badge">{LABEL[v.status]}</span>
                </p>
                <p>
                  <strong>{v.business_name}</strong> · {v.city}
                </p>
                {contact && <p className="muted">WhatsApp : {contact.whatsapp}</p>}
                <StatusForm action={setVendorStatus} id={v.id} current={v.status} options={OPTIONS} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
