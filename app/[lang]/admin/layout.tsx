import "./admin.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

// Espace réservé : non référencé par Google, en français seulement
export const metadata: Metadata = { title: "Espace admin", robots: { index: false, follow: false } };

// shortcut: textes de l'admin écrits en dur en français ; passer par content/*.json si l'admin devient bilingue
export default async function AdminLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang !== "fr") notFound();
  return <div className="admin">{children}</div>;
}
