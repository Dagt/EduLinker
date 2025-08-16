"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";
import SuggestionForm, { SuggestionFormData } from "../SuggestionForm";

export default function CreateSuggestion(){
  const [msg, setMsg] = useState("");
  const t = useTranslations('SuggestionCreate');

  async function onSubmit(data: SuggestionFormData){
    setMsg("");
    if(!data.title.trim() || !data.description.trim()){
      setMsg(t('missing'));
      return;
    }
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try{
      const tk = getToken();
      await apiPost("/suggestions/", data, tk);
      setMsg(t('created'));
    }catch(err: any){
      setMsg(err.message || t('error'));
    }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:560}}>
        <h2>{t('header')}</h2>
        <SuggestionForm
          onSubmit={onSubmit}
          titlePlaceholder={t('title')}
          descriptionPlaceholder={t('description')}
          submitLabel={t('create')}
        />
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
