import Link from "next/link";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { getDict, isLang } from "@/lib/content";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <section className="hero">
        {/* Emplacement réservé à l'animation 3D au scroll (étape 3) */}
        <div id="hero-3d" />
        <div className="hero-text">
          <h1>{d.hero.title}</h1>
          <p className="lead">{d.hero.text}</p>
          <Link className="btn" href={`/${lang}/contact`}>
            {d.hero.cta}
          </Link>
        </div>
      </section>
      <section className="section narrow">
        <h2>{d.about.title}</h2>
        <p>{d.about.text}</p>
      </section>
      <Services lang={lang} />
      <Testimonials lang={lang} />
    </>
  );
}
