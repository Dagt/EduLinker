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
      <main style={{padding:16, maxWidth:680}}>
        <h2>{t("FundraisingCreateEvent.header")}</h2>
        <form onSubmit={submit}>
          <input placeholder={t("FundraisingCreateEvent.name")} value={name} onChange={e=>setName(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <input placeholder={t("FundraisingCreateEvent.date")} value={date} onChange={e=>setDate(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t("FundraisingCreateEvent.description")} value={description} onChange={e=>setDescription(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
          <button>{t("FundraisingCreateEvent.create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
