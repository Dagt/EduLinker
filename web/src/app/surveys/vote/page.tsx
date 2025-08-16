"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { voteSurvey } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function SurveyVote(){
  const [id,setId]=useState("");
  const [choice,setChoice]=useState("");
  const [msg,setMsg]=useState("");
  const t = useTranslations("SurveyVote");

  if(!requireRole(["admin","student","teacher"])) return <p>{t("unauthorized")}</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk=getToken();
      await voteSurvey(Number(id), Number(choice), tk);
      setMsg(t("voted"));
      setId(""); setChoice("");
    }catch(err:any){ setMsg(err.message || t("error")); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>{t("header")}</h2>
      <form onSubmit={submit}>
        <input placeholder={t("surveyId")} value={id} onChange={e=>setId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("optionId")} value={choice} onChange={e=>setChoice(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>{t("vote")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
