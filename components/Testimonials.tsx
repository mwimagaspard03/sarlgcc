import { getTemoignages, getDict, type Lang } from "@/lib/content";

// N'affiche rien tant que content/temoignages.json est vide
export default function Testimonials({ lang }: { lang: Lang }) {
  const items = getTemoignages(lang);
  if (items.length === 0) return null;
  return (
    <section className="section">
      <h2>{getDict(lang).testimonials.title}</h2>
      <div className="services">
        {items.map((t) => (
          <blockquote key={t.name} className="service">
            <p>{t.text}</p>
            <footer>{t.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
