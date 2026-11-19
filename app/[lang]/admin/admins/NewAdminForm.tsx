"use client";
import { useActionState } from "react";
import { createAdmin } from "../actions-gestion";

type State = { error?: string; created?: { email: string; password: string; label: string } } | null;

export default function NewAdminForm() {
  const [state, action, pending] = useActionState<State, FormData>(createAdmin, null);

  if (state?.created) {
    const { email, password, label } = state.created;
    return (
      <div className="admin-card">
        <h2>Admin créé</h2>
        <p>
          Nom : <strong>{label}</strong>
        </p>
        <p>
          Identifiant : <code>{email}</code>
        </p>
        <p>
          Mot de passe provisoire : <code className="admin-pass">{password}</code>
        </p>
        <p className="admin-error">Ce mot de passe ne sera plus jamais affiché. Transmettez-le par un canal sûr maintenant.</p>
      </div>
    );
  }

  return (
    <form action={action} className="admin-form">
      <label>
        Nom
        <input name="full_name" required minLength={2} maxLength={100} />
      </label>
      <label>
        E-mail de connexion
        <input name="email" type="email" autoComplete="off" required maxLength={254} />
      </label>
      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Création…" : "Créer l'admin"}
      </button>
    </form>
  );
}
