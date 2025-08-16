"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type Suggestion = { id: number; title: string; description: string };

export default function SuggestionsPage(){
  const [items, setItems] = useState<Suggestion[]>([]);
  const t = useTranslations("Suggestions");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion[]>("/suggestions/", tk);
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t("header")}</h2>
        <Link href="/suggestions/create">{t('createNew')}</Link>
        <ul>
          {items.map(s => (
            <li key={s.id}>
              <Link href={`/suggestions/${s.id}`}><strong>{s.title}</strong></Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
