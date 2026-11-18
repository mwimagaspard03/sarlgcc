import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/supabase/auth";
import LoginForm from "./LoginForm";

export default async function ConnexionPage() {
  const ctx = await getAdminContext();
  if (ctx.state === "ok") redirect("/fr/admin");

  return (
    <section>
      <h1>Espace admin</h1>
      {ctx.state === "unconfigured" ? (
        <p className="muted">La connexion n'est pas configurée sur cet environnement.</p>
      ) : (
        <>
          <p className="lead">Connexion réservée à l'équipe GCC.</p>
          <LoginForm />
        </>
      )}
    </section>
  );
}
