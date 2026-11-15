import fr from "@/content/fr.json";
import en from "@/content/en.json";
import realisationsJson from "@/content/realisations.json";
import temoignages from "@/content/temoignages.json";

export const langs = ["fr", "en"] as const;
export type Lang = (typeof langs)[number];

type Bilingual = { fr: string; en: string };
type Realisation = { image: string | null; title: Bilingual; description: Bilingual };
const realisations: Realisation[] = realisationsJson; // typé à la main : le JSON vide est inféré comme never[]

const dicts = { fr, en };

export const isLang = (v: string): v is Lang => (langs as readonly string[]).includes(v);
export const getDict = (l: Lang) => dicts[l];

// shortcut: lit un fichier JSON, passer à la base de données en phase 2 (les pages ne changent pas)
export const getServices = (l: Lang) => dicts[l].services.items;

export const getRealisations = (l: Lang) =>
  realisations.map((r) => ({
    title: r.title[l],
    description: r.description[l],
    image: r.image,
  }));

type Temoignage = { name: string; text: { fr: string; en: string } };
export const getTemoignages = (l: Lang) =>
  (temoignages as Temoignage[]).map((t) => ({ name: t.name, text: t.text[l] }));

export const CONTACT = {
  whatsapp: "243831857841",
  whatsappDisplay: "+243 831 857 841",
  email: "mupilagaspard1@gmail.com",
};
