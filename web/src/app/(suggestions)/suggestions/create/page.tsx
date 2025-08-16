"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import {useTranslations} from 'next-intl';

export default function CreateSuggestion(){
  const [groupId,setGroupId]=useState<string>("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [msg,setMsg]=useState("");
  const t = useTranslations('SuggestionCreate');

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if(!title.trim() || !description.trim()){
      setMsg(t('missing'));
      return;
    }
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try{
      const tk = getToken();
      await apiPost("/suggestions/", { group: groupId ? Number(groupId): null, title, description }, tk);
      setMsg(t('created'));
      setGroupId(""); setTitle(""); setDescription("");
    }catch(err:any){ setMsg(err.message || t('error')); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>{t('header')}</h2>
      <form onSubmit={submit}>
        <input placeholder={t('groupId')} value={groupId} onChange={e=>setGroupId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t('title')} value={title} onChange={e=>setTitle(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <textarea placeholder={t('description')} value={description} onChange={e=>setDescription(e.target.value)}
                  style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
        <button>{t('create')}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
