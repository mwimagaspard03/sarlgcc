import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/supabase/auth";
import { signOut } from "./actions";

type Quote = {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email: string | null;
  message: string;
  status: "new" | "forwarded" | "closed";
  created_at: string;
  vendors: { business_name: string } | null;
  products: { title: string } | null;
};
type VendorRequest = {
  id: string;
  full_name: string;
  business_name: string | null;
  city: string | null;
  phone: string;
  message: string | null;
  status: "new" | "created" | "rejected";
  created_at: string;
};

const QUOTE_STATUS = { new: "Nouveau", forwarded: "Transmis", closed: "Clos" } as const;
const REQUEST_STATUS = { new: "Nouvelle", created: "Compte créé", rejected: "Refusée" } as const;
const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-outline">
        Se déconnecter
      </button>
    </form>
  );
}

export default async function AdminPage() {
  const ctx = await getAdminContext();
  if (ctx.state === "unconfigured") return <p className="muted">L'espace admin n'est pas configuré sur cet environnement.</p>;
  if (ctx.state === "anonymous") redirect("/fr/admin/connexion");
  if (ctx.state === "forbidden") {
    return (
      <section>
        <h1>Accès refusé</h1>
        <p className="lead">Ce compte n'a pas accès à l'espace admin.</p>
        <SignOutButton />
      </section>
    );
  }

  const { supabase, role } = ctx;
  // shortcut: 50 lignes maximum, sans pagination ; ajouter une pagination au-delà de 50 demandes en attente
  const [quotesRes, requestsRes] = await Promise.all([
    supabase
      .from("quote_requests")
      .select("id, visitor_name, visitor_phone, visitor_email, message, status, created_at, vendors(business_name), products(title)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("vendor_requests")
      .select("id, full_name, business_name, city, phone, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const quotes = (quotesRes.data ?? []) as unknown as Quote[];
  const requests = (requestsRes.data ?? []) as unknown as VendorRequest[];

  return (
    <section>
      <div className="admin-bar">
        <div>
          <h1>Tableau de bord</h1>
          <p className="muted">{role === "owner" ? "Propriétaire" : "Administrateur"}</p>
        </div>
        <SignOutButton />
      </div>

      <h2>Demandes de devis</h2>
      {quotesRes.error ? (
        <p className="admin-error">Impossible de charger les devis.</p>
      ) : quotes.length === 0 ? (
        <p className="muted">Aucune demande de devis pour le moment.</p>
      ) : (
        <ul className="admin-list">
          {quotes.map((q) => (
            <li key={q.id} className="admin-card">
              <p>
                <span className="admin-badge">{QUOTE_STATUS[q.status]}</span> <span className="muted">{date(q.created_at)}</span>
              </p>
              <p>
                <strong>{q.visitor_name}</strong> · {q.visitor_phone}
                {q.visitor_email ? ` · ${q.visitor_email}` : ""}
              </p>
              {(q.products || q.vendors) && (
                <p className="muted">
                  {q.products?.title ?? "Produit supprimé"} · {q.vendors?.business_name ?? "Vendeur supprimé"}
                </p>
              )}
              <p>{q.message}</p>
            </li>
          ))}
        </ul>
      )}

      <h2>Demandes de vendeur</h2>
      {requestsRes.error ? (
        <p className="admin-error">Impossible de charger les demandes.</p>
      ) : requests.length === 0 ? (
        <p className="muted">Aucune demande de vendeur pour le moment.</p>
      ) : (
        <ul className="admin-list">
          {requests.map((r) => (
            <li key={r.id} className="admin-card">
              <p>
                <span className="admin-badge">{REQUEST_STATUS[r.status]}</span> <span className="muted">{date(r.created_at)}</span>
              </p>
              <p>
                <strong>{r.full_name}</strong> · {r.phone}
              </p>
              {(r.business_name || r.city) && <p className="muted">{[r.business_name, r.city].filter(Boolean).join(" · ")}</p>}
              {r.message && <p>{r.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
