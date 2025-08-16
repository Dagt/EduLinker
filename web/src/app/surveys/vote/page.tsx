"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { voteSurvey } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function SurveyVote(){
  const [id,setId]=useState("");
  const [choice,setChoice]=useState("");
  const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  if(!requireRole(["admin","student","teacher"])) return <p>{t("SurveyVote.unauthorized")}</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk=getToken();
      await voteSurvey(Number(id), Number(choice), tk);
      setMsg(t("SurveyVote.voted"));
      setId(""); setChoice("");
    }catch(err:any){ setMsg(err.message || t("SurveyVote.error")); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>{t("SurveyVote.header")}</h2>
      <form onSubmit={submit}>
        <input placeholder={t("SurveyVote.surveyId")} value={id} onChange={e=>setId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("SurveyVote.optionId")} value={choice} onChange={e=>setChoice(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>{t("SurveyVote.vote")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
