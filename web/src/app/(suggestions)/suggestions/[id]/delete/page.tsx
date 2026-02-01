"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function SuggestionDelete({ params }:{ params:{ id:string } }){
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  async function onDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('SuggestionDelete.confirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/suggestions/${params.id}`, tk);
      setMsg(t('SuggestionDelete.deleted'));
    } catch (e:any) {
      setMsg(e.message || t('SuggestionDelete.error'));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("SuggestionDelete.pill", { defaultValue: "Sugerencias" })}</span>
            <h2>{t('SuggestionDelete.header')}</h2>
            <p className="subtle">
              {t("SuggestionDelete.subtitle", { defaultValue: "Esta accion no se puede deshacer." })}
            </p>
          </div>
        </header>
        <section className="card">
          <div className="stack">
            <button className="button" onClick={onDelete}>{t('SuggestionDelete.delete')}</button>
            {msg && <p className="alert success">{msg}</p>}
          </div>
        </section>
      </main>
    </>
  );
}
