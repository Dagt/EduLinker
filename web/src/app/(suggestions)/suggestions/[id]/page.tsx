"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

type Suggestion = { id:number; title:string; description:string; status?:string };

export default function SuggestionDetail({ params }:{ params:{ id:string } }){
  const [sug, setSug] = useState<Suggestion|null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion>(`/suggestions/${params.id}`, tk);
        setSug(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id]);

  if (!sug) return <p>{t("SuggestionDetail.loading")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t("SuggestionDetail.header", { id: sug.id })}</h2>
        <p><strong>{t("SuggestionDetail.title")}</strong> {sug.title}</p>
        <p><strong>{t("SuggestionDetail.description")}</strong> {sug.description}</p>
        {sug.status && <p><strong>{t("SuggestionDetail.status")}</strong> {sug.status}</p>}
        <Link href={`/suggestions/${sug.id}/edit`}>{t("SuggestionDetail.edit")}</Link>
        <br />
        <Link href={`/suggestions/${sug.id}/delete`}>{t("SuggestionDetail.delete")}</Link>
      </main>
    </>
  );
}
