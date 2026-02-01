"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function CreateSuggestion(){
  const [groupId,setGroupId]=useState<string>("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if(!title.trim() || !description.trim()){
      setMsg(t('SuggestionCreate.missing'));
      return;
    }
    if(groupId && isNaN(Number(groupId))){
      setMsg(t('SuggestionCreate.invalidGroup'));
      return;
    }
    if(typeof window !== 'undefined' && !window.confirm(t('SuggestionCreate.confirm'))) return;
    try{
      const tk = getToken();
      await apiPost("/suggestions/", { group: groupId ? Number(groupId): null, title, description }, tk);
      setMsg(t('SuggestionCreate.created'));
      setGroupId(""); setTitle(""); setDescription("");
    }catch(err:any){ setMsg(err.message || t('SuggestionCreate.error')); }
  }

  return (<>
    <Nav/>
    <main className="page narrow">
      <header className="page-header compact">
        <div>
          <span className="pill">{t("SuggestionCreate.pill", { defaultValue: "Sugerencias" })}</span>
          <h2>{t('SuggestionCreate.header')}</h2>
          <p className="subtle">
            {t("SuggestionCreate.subtitle", { defaultValue: "Comparte mejoras y comentarios del servicio." })}
          </p>
        </div>
      </header>
      <section className="card">
        <form className="form" onSubmit={submit}>
          <label>
            {t('SuggestionCreate.groupId')}
            <input placeholder={t('SuggestionCreate.groupId')} value={groupId} onChange={e=>setGroupId(e.target.value)} />
          </label>
          <label>
            {t('SuggestionCreate.title')}
            <input placeholder={t('SuggestionCreate.title')} value={title} onChange={e=>setTitle(e.target.value)} />
          </label>
          <label>
            {t('SuggestionCreate.description')}
            <textarea placeholder={t('SuggestionCreate.description')} value={description} onChange={e=>setDescription(e.target.value)} />
          </label>
          <div className="form-actions">
            <button className="button" type="submit">{t('SuggestionCreate.create')}</button>
          </div>
        </form>
      </section>
      {msg && <p className="alert success">{msg}</p>}
    </main>
  </>);
}
