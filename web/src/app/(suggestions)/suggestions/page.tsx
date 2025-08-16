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
  const { register, handleSubmit, reset } = useForm<FormData>();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion[]>("/suggestions/", tk);
        setItems(data);
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
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t("Suggestions.header")}</h2>
        <p><Link href="/suggestions/create">{t("Suggestions.createLink")}</Link></p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t("Suggestions.title")} {...register("title", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t("Suggestions.description")} {...register("description")}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t("Suggestions.send")}</button>
        </form>
        <ul>
          {items.map(s => (
            <li key={s.id}>
              <Link href={`/suggestions/${s.id}`}>{s.title}</Link>: {s.description}
              <button onClick={() => handleDelete(s.id)} style={{marginLeft:8}}>{t('Suggestions.delete')}</button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
