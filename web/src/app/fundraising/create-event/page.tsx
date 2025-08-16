"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { createFundraisingEvent } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function FundraisingCreateEvent(){
  const [name,setName]=useState(""); const [date,setDate]=useState("");
  const [description,setDescription]=useState(""); const [msg,setMsg]=useState("");
  const t = useTranslations("FundraisingCreateEvent");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      const body = { name, date, description }; // school_year se resuelve en backend si lo implementaste así; si no, añade el ID
      const res = await createFundraisingEvent(body, tk);
      setMsg(t("created", {id: res.id}));
      setName(""); setDate(""); setDescription("");
    }catch(e:any){ setMsg(e.message || t("error")); }
  }

  if (!requireRole(["admin", "director"])) return <p>{t("unauthorized")}</p>;

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>{t("header")}</h2>
        <form onSubmit={submit}>
          <input placeholder={t("name")} value={name} onChange={e=>setName(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder={t("date")} value={date} onChange={e=>setDate(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <textarea placeholder={t("description")} value={description} onChange={e=>setDescription(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
          <button>{t("create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
