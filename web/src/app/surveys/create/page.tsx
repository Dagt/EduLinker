"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function CreateSurvey(){
  const [scope,setScope]=useState<"GROUP"|"SCHOOL">("GROUP");
  const [groupId,setGroupId]=useState<string>("");
  const [title,setTitle]=useState("");
  const [options,setOptions]=useState("Sí,No");
  const [startAt,setStartAt]=useState("");
  const [endAt,setEndAt]=useState("");
  const [msg,setMsg]=useState("");
  const t = useTranslations("SurveyCreate");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    const tk = getToken();
    const opts = options.split(",").map(s=>s.trim()).filter(Boolean);
    await apiPost("/surveys/", {
      scope, group: scope==="GROUP" ? Number(groupId) : null,
      title, description: "", options: opts,
      is_anonymous: true,
      start_at: startAt, end_at: endAt
    }, tk);
    setMsg(t("created"));
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:680}}>
      <h2>{t("header")}</h2>
      <form onSubmit={submit}>
        <select value={scope} onChange={e=>setScope(e.target.value as any)} style={{display:"block",margin:"8px 0",padding:8}}>
          <option value="GROUP">{t("byGroup")}</option>
          <option value="SCHOOL">{t("wholeSchool")}</option>
        </select>
        {scope==="GROUP" && (
          <input placeholder={t("groupId")} value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        )}
        <input placeholder={t("title")} value={title} onChange={e=>setTitle(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("start")} value={startAt} onChange={e=>setStartAt(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("end")} value={endAt} onChange={e=>setEndAt(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("options")} value={options} onChange={e=>setOptions(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>{t("create")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
