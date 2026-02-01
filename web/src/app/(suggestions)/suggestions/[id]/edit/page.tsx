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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
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
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("SuggestionEdit.pill", { defaultValue: "Sugerencias" })}</span>
            <h2>{t('SuggestionEdit.header')}</h2>
            <p className="subtle">
              {t("SuggestionEdit.subtitle", { defaultValue: "Edita el contenido antes de publicarlo." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label>
              {t('SuggestionEdit.title')}
              <input placeholder={t('SuggestionEdit.title')} {...register('title', {required:true})} />
              {errors.title && <span className="meta">{t('Validation.required')}</span>}
            </label>
            <label>
              {t('SuggestionEdit.description')}
              <textarea placeholder={t('SuggestionEdit.description')} {...register('description', {required:true})} />
              {errors.description && <span className="meta">{t('Validation.required')}</span>}
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t('SuggestionEdit.update')}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
