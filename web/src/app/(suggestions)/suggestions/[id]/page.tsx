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
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("SuggestionDetail.pill", { defaultValue: "Sugerencias" })}</span>
            <h2>{t("SuggestionDetail.header", { id: sug.id })}</h2>
            <p className="subtle">{t("SuggestionDetail.subtitle", { defaultValue: "Detalle completo de la sugerencia." })}</p>
          </div>
          <div className="actions">
            <Link className="button secondary" href={`/suggestions/${sug.id}/edit`}>{t("SuggestionDetail.edit")}</Link>
            <Link className="button" href={`/suggestions/${sug.id}/delete`}>{t("SuggestionDetail.delete")}</Link>
          </div>
        </header>
        <section className="card stack">
          <div>
            <p className="meta">{t("SuggestionDetail.title")}</p>
            <p className="card-title">{sug.title}</p>
          </div>
          <div>
            <p className="meta">{t("SuggestionDetail.description")}</p>
            <p className="subtle">{sug.description}</p>
          </div>
          {sug.status && (
            <div>
              <p className="meta">{t("SuggestionDetail.status")}</p>
              <span className="chip">{sug.status}</span>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
