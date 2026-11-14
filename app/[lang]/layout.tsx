import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDict, isLang, langs } from "@/lib/content";
import "../globals.css";

export const dynamicParams = false;
export const generateStaticParams = () => langs.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { meta } = getDict(lang);
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <body>
        <Header lang={lang} />
        <main>{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
