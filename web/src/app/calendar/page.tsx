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
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Calendar.pill", { defaultValue: "Calendario" })}</span>
            <h2>{t("Calendar.header")}</h2>
            <p className="subtle">
              {t("Calendar.subtitle", { defaultValue: "Administra eventos y exporta el calendario." })}
            </p>
          </div>
          <div className="actions">
            <button className="button" onClick={downloadIcs}>{t("Calendar.downloadICS")}</button>
            <UploadButton onUploaded={(u)=>setLastUrl(u)} />
          </div>
        </header>
        {lastUrl && <p className="alert success">{t("Calendar.uploaded", {url:lastUrl})}</p>}
        <section className="grid cards">
          {events.map(e=>(
            <article key={e.id} className="card">
              <div className="card-header">
                <span className="chip">{e.status ?? "ACTIVE"}</span>
                <span className="meta">#{e.id}</span>
              </div>
              <p className="card-title">{e.title}</p>
              <p className="subtle">{new Date(e.start_at).toLocaleString()}</p>
              <div className="card-footer">
                <span className="meta">{e.location ?? ""}</span>
                {lastUrl && (
                  <button className="button secondary" onClick={()=>attachToEvent(e.id,lastUrl)}>
                    {t("Calendar.attachLast")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
