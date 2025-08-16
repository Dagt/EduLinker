"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { createExpenseEvidence } from "@/lib/api";
import UploadButton from "@/components/UploadButton";
import { useTranslations } from "next-intl";
import { requireRole } from "@/lib/roles";

export default function FundraisingExpense(){
  const t = useTranslations("FundraisingExpense");
  const [ledgerId,setLedgerId]=useState("");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [concept,setConcept]=useState("");
  const [fileUrl,setFileUrl]=useState("");
  const [msg,setMsg]=useState("");
  const allowed = requireRole(["admin","treasurer"]);

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if (!fileUrl) { setMsg(t("uploadFirst")); return; }
    try{
      const tk = getToken();
      const body:any = { amount: Number(amount), concept, file_url: fileUrl };
      if (ledgerId) body.ledger_id = Number(ledgerId);
      if (groupId) body.group_id = Number(groupId);
      const res = await createExpenseEvidence(body, tk);
      setMsg(t("success", { id: res.id }));
      setAmount(""); setConcept(""); setFileUrl(""); setLedgerId(""); setGroupId("");
    }catch(e:any){ setMsg(e.message || t("error")); }
  }

  if (!allowed) return <p>{t("unauthorized")}</p>;

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>{t("header")}</h2>
        <UploadButton onUploaded={(u)=>setFileUrl(u)} />
        {fileUrl && <p>{t("fileReady", { url: fileUrl })}</p>}
        <form onSubmit={submit}>
          <input placeholder={t("ledgerId")} value={ledgerId} onChange={e=>setLedgerId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <input placeholder={t("groupId")} value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <input placeholder={t("amount")} value={amount} onChange={e=>setAmount(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder={t("concept")} value={concept} onChange={e=>setConcept(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <button>{t("save")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
