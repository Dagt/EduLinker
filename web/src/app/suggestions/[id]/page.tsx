"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Suggestion = { id: number; title: string; description: string };

export default function SuggestionDetail({ params }: { params: { id: string } }){
  const [item, setItem] = useState<Suggestion | null>(null);
  const t = useTranslations('SuggestionDetail');

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion>(`/suggestions/${params.id}/`, tk);
        setItem(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id]);

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        {item ? (
          <>
            <h2>{t('header', { id: item.id })}</h2>
            <p><strong>{t('title')}:</strong> {item.title}</p>
            <p><strong>{t('description')}:</strong> {item.description}</p>
            <Link href={`/suggestions/${item.id}/edit`}>{t('edit')}</Link>
          </>
        ) : (
          <p>{t('loading')}</p>
        )}
      </main>
    </>
  );
}
