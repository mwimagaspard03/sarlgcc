import Link from "next/link";
import { signOut } from "./actions";

export default function AdminNav({ role }: { role: "owner" | "admin" }) {
  return (
    <nav className="admin-nav" aria-label="Espace admin">
      <Link href="/fr/admin">Tableau de bord</Link>
      <Link href="/fr/admin/vendeurs">Vendeurs</Link>
      {role === "owner" && <Link href="/fr/admin/admins">Admins</Link>}
      <form action={signOut}>
        <button type="submit" className="admin-link-btn">
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
