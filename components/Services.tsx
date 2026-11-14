import { getDict, getServices, type Lang } from "@/lib/content";

export default function Services({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section className="section">
      <h2>{d.services.title}</h2>
      <p className="lead">{d.services.intro}</p>
      <div className="services">
        {getServices(lang).map((s) => (
          <article key={s.title} className="service">
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
