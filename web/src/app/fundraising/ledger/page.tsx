"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { createFundraisingLedger } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { requireRole } from "@/lib/roles";

export default function FundraisingLedger(){
  const { t } = useTranslation();
  const [eventId,setEventId]=useState("");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [notes,setNotes]=useState("");
  const [msg,setMsg]=useState("");
  const allowed = requireRole(["admin","treasurer"]);

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if(!eventId || !groupId || !amount){
      setMsg(t('Validation.required'));
      return;
    }
    if([eventId,groupId,amount].some(v=>isNaN(Number(v)))){
      setMsg(t('Validation.invalidNumber'));
      return;
    }
    try{
      const tk = getToken();
      const res = await createFundraisingLedger({
        event_id: Number(eventId),
        group_id: Number(groupId),
        amount_collected: Number(amount),
        notes
      }, tk);
      setMsg(t("FundraisingLedger.success", { id: res.id }));
      setAmount(""); setNotes("");
    }catch(e:any){ setMsg(e.message || t("FundraisingLedger.error")); }
  }

  if (!allowed) return <p>{t("FundraisingLedger.unauthorized")}</p>;

  return (
    <>
      <Nav/>
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingLedger.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t("FundraisingLedger.header")}</h2>
            <p className="subtle">
              {t("FundraisingLedger.subtitle", { defaultValue: "Registra el dinero recolectado por grupo." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("FundraisingLedger.eventId")}
              <input placeholder={t("FundraisingLedger.eventId")} value={eventId} onChange={e=>setEventId(e.target.value)} required/>
            </label>
            <label>
              {t("FundraisingLedger.groupId")}
              <input placeholder={t("FundraisingLedger.groupId")} value={groupId} onChange={e=>setGroupId(e.target.value)} required/>
            </label>
            <label>
              {t("FundraisingLedger.amount")}
              <input placeholder={t("FundraisingLedger.amount")} value={amount} onChange={e=>setAmount(e.target.value)} required/>
            </label>
            <label>
              {t("FundraisingLedger.notes")}
              <textarea placeholder={t("FundraisingLedger.notes")} value={notes} onChange={e=>setNotes(e.target.value)} />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("FundraisingLedger.save")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
