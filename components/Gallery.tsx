import Image from "next/image";
import { getRealisations, getDict, type Lang } from "@/lib/content";

// Ajouter une réalisation : photo dans public/realisations/ + une entrée dans content/realisations.json
export default function Gallery({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <div className="gallery">
      {getRealisations(lang).map((r, i) => (
        <figure key={i} className="project">
          {r.image ? (
            <Image src={`/realisations/${r.image}`} alt={r.title} width={800} height={600} />
          ) : (
            <div className="placeholder" role="img" aria-label={d.realisations.soon} />
          )}
          <figcaption>
            <h3>{r.title}</h3>
            <p>{r.description}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
