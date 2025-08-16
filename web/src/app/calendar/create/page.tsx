"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function CreateEvent(){
  const [scope,setScope]=useState<"GLOBAL"|"GROUP">("GROUP");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [location,setLocation]=useState("");
  const [startAt,setStartAt]=useState("");
  const [endAt,setEndAt]=useState("");
  const [groupIds,setGroupIds]=useState("1");
  const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    const tk = getToken();
    const body:any = { scope, title, description, location, start_at:startAt, end_at:endAt };
    if (scope==="GROUP") body.group_ids = groupIds.split(",").map(s=>Number(s.trim())).filter(Boolean);
    await apiPost("/events/", body, tk);
    setMsg(t("CalendarCreate.created"));
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:680}}>
      <h2>{t("CalendarCreate.header")}</h2>
      <form onSubmit={submit}>
        <select value={scope} onChange={e=>setScope(e.target.value as any)} style={{display:"block",margin:"8px 0",padding:8}}>
          <option value="GROUP">{t("CalendarCreate.byGroup")}</option>
          <option value="GLOBAL">{t("CalendarCreate.global")}</option>
        </select>
        <input placeholder={t("CalendarCreate.title")} value={title} onChange={e=>setTitle(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("CalendarCreate.location")} value={location} onChange={e=>setLocation(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("CalendarCreate.start")} value={startAt} onChange={e=>setStartAt(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t("CalendarCreate.end")} value={endAt} onChange={e=>setEndAt(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        {scope==="GROUP" && (
          <input placeholder={t("CalendarCreate.groupIds")} value={groupIds} onChange={e=>setGroupIds(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        )}
        <textarea placeholder={t("CalendarCreate.description")} value={description} onChange={e=>setDescription(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
        <button>{t("CalendarCreate.create")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
