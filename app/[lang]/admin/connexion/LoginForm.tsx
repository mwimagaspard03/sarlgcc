"use client";
import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<{ error: string } | null, FormData>(signIn, null);
  return (
    <form action={action} className="admin-form">
      <label>
        E-mail
        <input name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" autoComplete="current-password" required maxLength={128} />
      </label>
      {state?.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
