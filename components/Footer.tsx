import { getDict, CONTACT, type Lang } from "@/lib/content";

export default function Footer({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <footer className="footer">
      <p>
        <strong>GCC Sarl</strong> – Group Congo Construct
      </p>
      <p>{d.contact.area}</p>
      <p>
        {CONTACT.whatsappDisplay} · {CONTACT.email}
      </p>
      <p className="muted">
        © {new Date().getFullYear()} GCC Sarl. {d.footer.rights}
      </p>
    </footer>
  );
}
