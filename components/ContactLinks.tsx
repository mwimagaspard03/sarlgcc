import { getDict, CONTACT, type Lang } from "@/lib/content";

export default function ContactLinks({ lang }: { lang: Lang }) {
  const c = getDict(lang).contact;
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(c.whatsappMessage)}`;
  return (
    <div className="actions">
      <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
        {c.whatsapp}
      </a>
      <a className="btn btn-outline" href={`mailto:${CONTACT.email}`}>
        {c.email}
      </a>
    </div>
  );
}
