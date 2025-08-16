"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type FormData = { title: string; description: string };

type Suggestion = { id:number; title:string; description:string };

export default function SuggestionEdit({ params }:{ params:{ id:string } }){
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [msg, setMsg] = useState("");
  const t = useTranslations("SuggestionEdit");

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
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try {
      const tk = getToken();
      await apiPatch(`/suggestions/${params.id}`, data, tk);
      setMsg(t('updated'));
    } catch (e:any) {
      setMsg(e.message || t('error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t('header')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t('title')} {...register('title', {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t('description')} {...register('description', {required:true})}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t('update')}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
