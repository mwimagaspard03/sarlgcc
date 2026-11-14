import { notFound } from "next/navigation";
import Services from "@/components/Services";
import ContactLinks from "@/components/ContactLinks";
import { isLang } from "@/lib/content";

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
      <Services lang={lang} />
      <section className="section">
        <ContactLinks lang={lang} />
      </section>
    </>
  );
}
