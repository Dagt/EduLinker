"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ComplaintThread({ params }: { params: { id: string } }){
  const id = Number(params.id);
  const [complaint,setComplaint]=useState<any>();
  const [text,setText]=useState("");
  const [msg,setMsg]=useState("");
  const { t } = useTranslation();

  async function load(){
    try{
      const tk = getToken();
      const data = await apiGet<any>(`/complaints/${id}/`, tk);
      setComplaint(data);
    }catch(e:any){ setMsg(e.message || t("ComplaintThread.loadError")); }
  }

  async function send(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      await apiPost(`/complaints/${id}/messages/`, { message: text, attachments: [] }, tk);
      setText(""); await load();
    }catch(e:any){ setMsg(e.message || t("ComplaintThread.sendError")); }
  }

  useEffect(()=>{ load(); },[id]);

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:780}}>
        <h2>{t("ComplaintThread.header", {id})}</h2>
        {complaint ? (
          <>
            <p><b>{t("ComplaintThread.status")}</b> {complaint.status}</p>
            <p><b>{t("ComplaintThread.description")}</b> {complaint.description}</p>
            <h3>{t("ComplaintThread.messages")}</h3>
            <ul>
              {complaint.messages?.map((m:any)=>(
                <li key={m.id} style={{marginBottom:8}}>
                  <div><b>{m.author}</b> — {new Date(m.created_at).toLocaleString()}</div>
                  <div>{m.message}</div>
                </li>
              ))}
            </ul>
            <form onSubmit={send} style={{marginTop:12}}>
              <textarea value={text} onChange={e=>setText(e.target.value)}
                        placeholder={t("ComplaintThread.reply")}
                        style={{display:"block",width:"100%",minHeight:120,margin:"8px 0",padding:8}}/>
              <button>{t("ComplaintThread.send")}</button>
            </form>
          </>
        ) : <p>{t("ComplaintThread.loading")}</p>}
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
