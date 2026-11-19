"use client";
import Link from "next/link";
import { useActionState } from "react";
import { createVendor } from "../../actions-gestion";

type State = { error?: string; created?: { email: string; password: string; label: string } } | null;

export default function NewVendorForm() {
  const [state, action, pending] = useActionState<State, FormData>(createVendor, null);

  if (state?.created) {
    const { email, password, label } = state.created;
    return (
      <div className="admin-card">
        <h2>Compte créé</h2>
        <p>
          Vendeur : <strong>{label}</strong>
        </p>
        <p>
          Identifiant : <code>{email}</code>
        </p>
        <p>
          Mot de passe provisoire : <code className="admin-pass">{password}</code>
        </p>
        <p className="admin-error">Ce mot de passe ne sera plus jamais affiché. Transmettez-le au vendeur par WhatsApp maintenant. Il pourra le changer depuis son espace (à venir).</p>
        <Link className="btn" href="/fr/admin/vendeurs">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="admin-form">
      <label>
        Nom du commerce ou de l'entreprise
        <input name="business_name" required minLength={2} maxLength={120} />
      </label>
      <label>
        Ville ou commune
        <input name="city" required minLength={2} maxLength={80} />
      </label>
      <label>
        Numéro WhatsApp (avec l'indicatif, par exemple +243…)
        <input name="whatsapp" type="tel" inputMode="tel" required maxLength={30} />
      </label>
      <label>
        E-mail de connexion du vendeur
        <input name="email" type="email" autoComplete="off" required maxLength={254} />
      </label>
      <label>
        Description (facultatif)
        <textarea name="description" rows={4} maxLength={1000} />
      </label>
      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Création…" : "Créer le compte vendeur"}
      </button>
    </form>
  );
}
