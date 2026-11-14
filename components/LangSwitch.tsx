"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/content";

export default function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname();
  const other = lang === "fr" ? "en" : "fr";
  return (
    <Link href={path.replace(`/${lang}`, `/${other}`)} hrefLang={other} className="lang">
      {other === "fr" ? "Français" : "English"}
    </Link>
  );
}
