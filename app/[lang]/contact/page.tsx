import { notFound } from "next/navigation";
import ContactLinks from "@/components/ContactLinks";
import { getDict, isLang } from "@/lib/content";

// shortcut: pas de formulaire, WhatsApp + e-mail suffisent; ajouter une route API si le volume de demandes l'exige
export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  return (
    <section className="section narrow">
      <h1>{d.contact.title}</h1>
      <p className="lead">{d.contact.intro}</p>
      <ContactLinks lang={lang} />
    </section>
  );
}
