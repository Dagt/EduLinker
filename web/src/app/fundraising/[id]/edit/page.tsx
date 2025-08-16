"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type FormData = { name:string; date:string; description:string };
type Event = { id:number; name:string; date:string; description:string };

export default function FundraisingEdit({ params }:{ params:{ id:string } }){
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Event>(`/fundraising-events/${params.id}`, tk);
        reset({ name: data.name, date: data.date, description: data.description });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id, reset]);

  async function onSubmit(data: FormData){
    if(typeof window !== 'undefined' && !window.confirm(t('FundraisingEdit.confirm'))) return;
    try {
      const tk = getToken();
      await apiPatch(`/fundraising-events/${params.id}`, data, tk);
      setMsg(t('FundraisingEdit.updated'));
    } catch (e:any) {
      setMsg(e.message || t('FundraisingEdit.error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t('FundraisingEdit.header')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t('FundraisingEdit.name')} {...register('name', {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <input placeholder={t('FundraisingEdit.date')} {...register('date', {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t('FundraisingEdit.description')} {...register('description')}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t('FundraisingEdit.update')}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
