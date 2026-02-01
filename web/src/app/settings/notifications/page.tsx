"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function NotifSettings(){
  const [prefs,setPrefs]=useState<any[]>([]);
  const tk = getToken();
  const { t } = useTranslation();
  const kinds = [
    { key: "event", label: t("NotificationSettings.event") },
    { key: "survey", label: t("NotificationSettings.survey") },
    { key: "complaint", label: t("NotificationSettings.complaint") },
    { key: "complaint_message", label: t("NotificationSettings.complaint_message") },
  ];
  useEffect(()=>{ (async()=>{
    try{ const p = await apiGet<any[]>("/notifications/prefs/", tk); setPrefs(p); }catch{}
  })(); },[]);

  async function toggle(kind:string){
    const existing = prefs.find((p:any)=>p.kind===kind);
    if (!existing){
      const created = await apiPost("/notifications/prefs/", { kind, enabled:false }, tk);
      setPrefs([...prefs, created]);
    } else {
      const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/prefs/${existing.id}/`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", "Authorization": `Bearer ${tk}`, "X-School-ID": process.env.NEXT_PUBLIC_SCHOOL_ID || "1" },
        body: JSON.stringify({ enabled: !existing.enabled })
      });
      const res = await updated.json();
      setPrefs(prefs.map((p:any)=>p.id===existing.id ? res : p));
    }
  }

  function isEnabled(kind:string){
    const e = prefs.find((p:any)=>p.kind===kind);
    return e ? e.enabled : true; // por defecto ON
  }

  return (
    <>
      <Nav/>
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("NotificationSettings.pill", { defaultValue: "Preferencias" })}</span>
            <h2>{t("NotificationSettings.header")}</h2>
            <p className="subtle">
              {t("NotificationSettings.subtitle", { defaultValue: "Gestiona las notificaciones que recibes." })}
            </p>
          </div>
        </header>
        <section className="card">
          <div className="stack">
            {kinds.map((k) => (
              <label key={k.key} className="option">
                <input type="checkbox" checked={isEnabled(k.key)} onChange={() => toggle(k.key)} />
                <span>{k.label}</span>
              </label>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
