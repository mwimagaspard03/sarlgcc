import Link from "next/link";
import Logo from "./Logo";
import LangSwitch from "./LangSwitch";
import { getDict, type Lang } from "@/lib/content";

export default function Header({ lang }: { lang: Lang }) {
  const { nav } = getDict(lang);
  return (
    <header className="header">
      <Link href={`/${lang}`} aria-label="GCC Sarl">
        <Logo />
      </Link>
      <nav className="nav">
        <Link href={`/${lang}`}>{nav.home}</Link>
        <Link href={`/${lang}/services`}>{nav.services}</Link>
        <Link href={`/${lang}/realisations`}>{nav.realisations}</Link>
        <Link href={`/${lang}/contact`}>{nav.contact}</Link>
        <LangSwitch lang={lang} />
      </nav>
    </header>
  );
}
