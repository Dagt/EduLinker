"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { updateSuggestionStatus } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

function SuggestionStatusContent(){
  const [id,setId]=useState("");
  const [status,setStatus]=useState("");
  const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  if(!requireRole(["admin","teacher"])) return <p>{t('SuggestionStatus.unauthorized')}</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if(!id.trim() || !status.trim()){
      setMsg(t('SuggestionStatus.missing'));
      return;
    }
    if(typeof window !== 'undefined' && !window.confirm(t('SuggestionStatus.confirm'))) return;
    try{
      const tk = getToken();
      await updateSuggestionStatus(Number(id), status, tk);
      setMsg(t('SuggestionStatus.updated'));
      setId(""); setStatus("");
    }catch(err:any){ setMsg(err.message || t('SuggestionStatus.error')); }
  }

  return (<>
    <Nav/>
    <main className="page narrow">
      <header className="page-header compact">
        <div>
          <span className="pill">{t("SuggestionStatus.pill", { defaultValue: "Sugerencias" })}</span>
          <h2>{t('SuggestionStatus.title')}</h2>
          <p className="subtle">
            {t("SuggestionStatus.subtitle", { defaultValue: "Actualiza el estado de una sugerencia." })}
          </p>
        </div>
      </header>
      <section className="card">
        <form className="form" onSubmit={submit}>
          <label>
            {t('SuggestionStatus.id')}
            <input placeholder={t('SuggestionStatus.id')} value={id} onChange={e=>setId(e.target.value)} />
          </label>
          <label>
            {t('SuggestionStatus.status')}
            <input placeholder={t('SuggestionStatus.status')} value={status} onChange={e=>setStatus(e.target.value)} />
          </label>
          <div className="form-actions">
            <button className="button" type="submit">{t('SuggestionStatus.update')}</button>
          </div>
        </form>
      </section>
      {msg && <p className="alert success">{msg}</p>}
    </main>
  </>);
}

export default function SuggestionStatus(){
  return <SuggestionStatusContent/>;
}
