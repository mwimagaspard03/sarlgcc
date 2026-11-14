import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { getDict, isLang } from "@/lib/content";

export default async function RealisationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  return (
    <section className="section">
      <h1>{d.realisations.title}</h1>
      <p className="lead">{d.realisations.intro}</p>
      <Gallery lang={lang} />
    </section>
  );
}
