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
    <main className="page narrow">
      <header className="page-header compact">
        <div>
          <span className="pill">{t("CalendarCreate.pill", { defaultValue: "Calendario" })}</span>
          <h2>{t("CalendarCreate.header")}</h2>
          <p className="subtle">
            {t("CalendarCreate.subtitle", { defaultValue: "Programa eventos y actividades para la comunidad." })}
          </p>
        </div>
      </header>
      <section className="card">
        <form className="form" onSubmit={submit}>
          <label>
            {t("CalendarCreate.scope", { defaultValue: "Alcance" })}
            <select value={scope} onChange={e=>setScope(e.target.value as any)}>
              <option value="GROUP">{t("CalendarCreate.byGroup")}</option>
              <option value="GLOBAL">{t("CalendarCreate.global")}</option>
            </select>
          </label>
          <label>
            {t("CalendarCreate.title")}
            <input placeholder={t("CalendarCreate.title")} value={title} onChange={e=>setTitle(e.target.value)} />
          </label>
          <label>
            {t("CalendarCreate.location")}
            <input placeholder={t("CalendarCreate.location")} value={location} onChange={e=>setLocation(e.target.value)} />
          </label>
          <label>
            {t("CalendarCreate.start")}
            <input placeholder={t("CalendarCreate.start")} value={startAt} onChange={e=>setStartAt(e.target.value)} />
          </label>
          <label>
            {t("CalendarCreate.end")}
            <input placeholder={t("CalendarCreate.end")} value={endAt} onChange={e=>setEndAt(e.target.value)} />
          </label>
          {scope==="GROUP" && (
            <label>
              {t("CalendarCreate.groupIds")}
              <input placeholder={t("CalendarCreate.groupIds")} value={groupIds} onChange={e=>setGroupIds(e.target.value)} />
            </label>
          )}
          <label>
            {t("CalendarCreate.description")}
            <textarea placeholder={t("CalendarCreate.description")} value={description} onChange={e=>setDescription(e.target.value)} />
          </label>
          <div className="form-actions">
            <button className="button" type="submit">{t("CalendarCreate.create")}</button>
          </div>
        </form>
      </section>
      {msg && <p className="alert success">{msg}</p>}
    </main>
  </>);
}
