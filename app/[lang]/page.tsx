import { notFound } from "next/navigation";
import Parcours from "@/components/Parcours";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { getDict, isLang } from "@/lib/content";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <Parcours lang={lang} hero={d.hero} parcours={d.parcours} />
      <section className="section narrow">
        <h2>{d.about.title}</h2>
        <p>{d.about.text}</p>
      </section>
      <Services lang={lang} />
      <Testimonials lang={lang} />
    </>
  );
}
