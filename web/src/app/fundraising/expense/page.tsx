"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { createExpenseEvidence } from "@/lib/api";
import UploadButton from "@/components/UploadButton";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { requireRole } from "@/lib/roles";

export default function FundraisingExpense(){
  const { t } = useTranslation();
  const [ledgerId,setLedgerId]=useState("");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [concept,setConcept]=useState("");
  const [fileUrl,setFileUrl]=useState("");
  const [msg,setMsg]=useState("");
  const allowed = requireRole(["admin","treasurer"]);

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if (!fileUrl) { setMsg(t("FundraisingExpense.uploadFirst")); return; }
    if(!amount || !concept){
      setMsg(t('Validation.required'));
      return;
    }
    if(
      isNaN(Number(amount)) ||
      (ledgerId && isNaN(Number(ledgerId))) ||
      (groupId && isNaN(Number(groupId)))
    ){
      setMsg(t('Validation.invalidNumber'));
      return;
    }
    try{
      const tk = getToken();
      const body:any = { amount: Number(amount), concept, file_url: fileUrl };
      if (ledgerId) body.ledger_id = Number(ledgerId);
      if (groupId) body.group_id = Number(groupId);
      const res = await createExpenseEvidence(body, tk);
      setMsg(t("FundraisingExpense.success", { id: res.id }));
      setAmount(""); setConcept(""); setFileUrl(""); setLedgerId(""); setGroupId("");
    }catch(e:any){ setMsg(e.message || t("FundraisingExpense.error")); }
  }

  if (!allowed) return <p>{t("FundraisingExpense.unauthorized")}</p>;

  return (
    <>
      <Nav/>
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingExpense.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t("FundraisingExpense.header")}</h2>
            <p className="subtle">
              {t("FundraisingExpense.subtitle", { defaultValue: "Carga evidencias de gastos realizados." })}
            </p>
          </div>
        </header>
        <section className="card">
          <div className="stack">
            <UploadButton onUploaded={(u)=>setFileUrl(u)} />
            {fileUrl && <p className="alert success">{t("FundraisingExpense.fileReady", { url: fileUrl })}</p>}
          </div>
          <form className="form" onSubmit={submit}>
            <label>
              {t("FundraisingExpense.ledgerId")}
              <input placeholder={t("FundraisingExpense.ledgerId")} value={ledgerId} onChange={e=>setLedgerId(e.target.value)} />
            </label>
            <label>
              {t("FundraisingExpense.groupId")}
              <input placeholder={t("FundraisingExpense.groupId")} value={groupId} onChange={e=>setGroupId(e.target.value)} />
            </label>
            <label>
              {t("FundraisingExpense.amount")}
              <input placeholder={t("FundraisingExpense.amount")} value={amount} onChange={e=>setAmount(e.target.value)} required/>
            </label>
            <label>
              {t("FundraisingExpense.concept")}
              <input placeholder={t("FundraisingExpense.concept")} value={concept} onChange={e=>setConcept(e.target.value)} required/>
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("FundraisingExpense.save")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
