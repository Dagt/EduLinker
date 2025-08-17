"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost, authHeaders } from "@/lib/api";
import UploadButton from "@/components/UploadButton";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function Calendar(){
  const [events,setEvents]=useState<any[]>([]);
  const [lastUrl,setLastUrl]=useState("");
  const { t } = useTranslation();

  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const list = await apiGet<any[]>("/events/", tk);
    setEvents(list);
  })(); },[]);

  async function attachToEvent(eventId:number, fileUrl:string){
    const tk = getToken();
    await apiPost(`/events/${eventId}/attachments/`, { file_url: fileUrl, filename: fileUrl.split("/").pop(), mime_type: "" }, tk);
    alert(t("Calendar.attached"));
  }

  async function downloadIcs(){
    const tk = getToken();
    const headers = authHeaders(tk);
    delete headers["Content-Type"];
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/ics/`, { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>{t("Calendar.header")}</h2>
        <button onClick={downloadIcs}>{t("Calendar.downloadICS")}</button>
        <UploadButton onUploaded={(u)=>setLastUrl(u)} />
        {lastUrl && <p>{t("Calendar.uploaded", {url:lastUrl})}</p>}
        <ul>
          {events.map(e=>(
            <li key={e.id}>
              {e.title} — {new Date(e.start_at).toLocaleString()} {" "}
              {lastUrl && <button onClick={()=>attachToEvent(e.id,lastUrl)}>{t("Calendar.attachLast")}</button>}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}