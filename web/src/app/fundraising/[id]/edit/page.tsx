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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
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
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingEdit.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t('FundraisingEdit.header')}</h2>
            <p className="subtle">
              {t("FundraisingEdit.subtitle", { defaultValue: "Actualiza los datos del evento." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label>
              {t('FundraisingEdit.name')}
              <input placeholder={t('FundraisingEdit.name')} {...register('name', {required:true})} />
              {errors.name && <span className="meta">{t('Validation.required')}</span>}
            </label>
            <label>
              {t('FundraisingEdit.date')}
              <input placeholder={t('FundraisingEdit.date')} {...register('date', {required:true})} />
              {errors.date && <span className="meta">{t('Validation.required')}</span>}
            </label>
            <label>
              {t('FundraisingEdit.description')}
              <textarea placeholder={t('FundraisingEdit.description')} {...register('description')} />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t('FundraisingEdit.update')}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
