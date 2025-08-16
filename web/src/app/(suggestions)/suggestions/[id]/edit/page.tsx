"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type FormData = { title: string; description: string };

type Suggestion = { id:number; title:string; description:string };

export default function SuggestionEdit({ params }:{ params:{ id:string } }){
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion>(`/suggestions/${params.id}`, tk);
        reset({ title: data.title, description: data.description });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id, reset]);

  async function onSubmit(data: FormData){
    if(typeof window !== 'undefined' && !window.confirm(t('SuggestionEdit.confirm'))) return;
    try {
      const tk = getToken();
      await apiPatch(`/suggestions/${params.id}`, data, tk);
      setMsg(t('SuggestionEdit.updated'));
    } catch (e:any) {
      setMsg(e.message || t('SuggestionEdit.error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t('SuggestionEdit.header')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t('SuggestionEdit.title')} {...register('title', {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t('SuggestionEdit.description')} {...register('description', {required:true})}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t('SuggestionEdit.update')}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
