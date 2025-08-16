"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function CreateEvent(){
  const [scope,setScope]=useState<"GLOBAL"|"GROUP">("GROUP");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [location,setLocation]=useState("");
  const [startAt,setStartAt]=useState("");
  const [endAt,setEndAt]=useState("");
  const [groupIds,setGroupIds]=useState("1");
  const [msg,setMsg]=useState("");
  const t = useTranslations('CalendarCreate');

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    const tk = getToken();
    const body:any = { scope, title, description, location, start_at:startAt, end_at:endAt };
    if (scope==="GROUP") body.group_ids = groupIds.split(",").map(s=>Number(s.trim())).filter(Boolean);
    await apiPost("/events/", body, tk);
    setMsg(t('created'));
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:680}}>
      <h2>{t('header')}</h2>
      <form onSubmit={submit}>
        <select value={scope} onChange={e=>setScope(e.target.value as any)} style={{display:"block",margin:"8px 0",padding:8}}>
          <option value="GROUP">{t('scopeGroup')}</option>
          <option value="GLOBAL">{t('scopeGlobal')}</option>
        </select>
        <input placeholder={t('title')} value={title} onChange={e=>setTitle(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t('location')} value={location} onChange={e=>setLocation(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t('start')} value={startAt} onChange={e=>setStartAt(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t('end')} value={endAt} onChange={e=>setEndAt(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        {scope==="GROUP" && (
          <input placeholder={t('groupIds')} value={groupIds} onChange={e=>setGroupIds(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        )}
        <textarea placeholder={t('description')} value={description} onChange={e=>setDescription(e.target.value)} style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
        <button>{t('create')}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
