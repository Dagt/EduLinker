"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function FundraisingCreateEvent(){
  const [name,setName]=useState(""); const [date,setDate]=useState("");
  const [description,setDescription]=useState(""); const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if(!name.trim() || !date.trim()){
      setMsg(t('Validation.required'));
      return;
    }
    try{
      const tk = getToken();
      const body = { name, date, description }; // school_year se resuelve en backend si lo implementaste así; si no, añade el ID
      const res = await apiPost<any>("/fundraising-events/", body, tk);
      setMsg(t("FundraisingCreateEvent.created", {id: res.id}));
      setName(""); setDate(""); setDescription("");
    }catch(e:any){ setMsg(e.message || t("FundraisingCreateEvent.error")); }
  }

  return (
    <>
      <Nav/>
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingCreateEvent.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t("FundraisingCreateEvent.header")}</h2>
            <p className="subtle">
              {t("FundraisingCreateEvent.subtitle", { defaultValue: "Crea eventos para recaudar fondos." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("FundraisingCreateEvent.name")}
              <input placeholder={t("FundraisingCreateEvent.name")} value={name} onChange={e=>setName(e.target.value)} />
            </label>
            <label>
              {t("FundraisingCreateEvent.date")}
              <input placeholder={t("FundraisingCreateEvent.date")} value={date} onChange={e=>setDate(e.target.value)} />
            </label>
            <label>
              {t("FundraisingCreateEvent.description")}
              <textarea placeholder={t("FundraisingCreateEvent.description")} value={description} onChange={e=>setDescription(e.target.value)} />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("FundraisingCreateEvent.create")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
