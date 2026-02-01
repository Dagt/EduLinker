"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function FundraisingDelete({ params }:{ params:{ id:string } }){
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  async function onDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('FundraisingDelete.confirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/fundraising-events/${params.id}`, tk);
      setMsg(t('FundraisingDelete.deleted'));
    } catch (e:any) {
      setMsg(e.message || t('FundraisingDelete.error'));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingDelete.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t('FundraisingDelete.header')}</h2>
            <p className="subtle">
              {t("FundraisingDelete.subtitle", { defaultValue: "Confirma antes de eliminar este evento." })}
            </p>
          </div>
        </header>
        <section className="card">
          <div className="stack">
            <button className="button" onClick={onDelete}>{t('FundraisingDelete.delete')}</button>
            {msg && <p className="alert success">{msg}</p>}
          </div>
        </section>
      </main>
    </>
  );
}
