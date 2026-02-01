"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

type Suggestion = { id: number; title: string; description: string };

type FormData = { title: string; description: string };

export default function SuggestionsPage(){
  const [items, setItems] = useState<Suggestion[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
      const data = await apiGet<Suggestion[]>("/suggestions/", tk);
      const list = Array.isArray(data) ? data : (data as any).results || [];
      setItems(list);
    } catch (e) {
      console.error(e);
    }
  })();
  }, []);

  async function onSubmit(data: FormData){
    try {
      const tk = getToken();
      const created = await apiPost<Suggestion>("/suggestions/", data, tk);
      setItems([...items, created]);
      reset();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: number){
    if (typeof window !== 'undefined' && !window.confirm(t('Suggestions.deleteConfirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/suggestions/${id}/`, tk);
      setItems(items.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Suggestions.pill", { defaultValue: "Sugerencias" })}</span>
            <h2>{t("Suggestions.header")}</h2>
            <p className="subtle">{t("Suggestions.subtitle", { defaultValue: "Mejoras y propuestas de la comunidad." })}</p>
          </div>
          <Link className="button secondary" href="/suggestions/create">
            {t("Suggestions.createLink")}
          </Link>
        </header>
        <section className="card form">
          <h3>{t("Suggestions.send")}</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <input placeholder={t("Suggestions.title")} {...register("title", {required:true})} />
            {errors.title && <p className="alert error">{t('Validation.required')}</p>}
            <textarea placeholder={t("Suggestions.description")} {...register("description", {required:true})} />
            {errors.description && <p className="alert error">{t('Validation.required')}</p>}
            <button className="button" type="submit">{t("Suggestions.send")}</button>
          </form>
        </section>
        <section className="grid cards">
          {items.map(s => (
            <article key={s.id} className="card">
              <div className="card-header">
                <span className="chip">#{s.id}</span>
              </div>
              <p className="card-title">
                <Link className="link" href={`/suggestions/${s.id}`}>{s.title}</Link>
              </p>
              <p className="subtle">{s.description}</p>
              <div className="card-footer">
                <button className="button secondary" onClick={() => handleDelete(s.id)}>
                  {t('Suggestions.delete')}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
