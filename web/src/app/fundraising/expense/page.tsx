"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import UploadButton from "@/components/UploadButton";

export default function FundraisingExpense(){
  const [ledgerId,setLedgerId]=useState("");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [concept,setConcept]=useState("");
  const [fileUrl,setFileUrl]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    if (!fileUrl) { setMsg("Sube el archivo primero"); return; }
    try{
      const tk = getToken();
      const body:any = { amount: Number(amount), concept, file_url: fileUrl };
      if (ledgerId) body.ledger_id = Number(ledgerId);
      if (groupId) body.group_id = Number(groupId);
      const res = await apiPost("/expense-evidences/", body, tk);
      setMsg(`Evidencia registrada #${res.id}`);
      setAmount(""); setConcept(""); setFileUrl(""); setLedgerId(""); setGroupId("");
    }catch(e:any){ setMsg(e.message || "Error al registrar evidencia"); }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>Registrar evidencia de gasto</h2>
        <UploadButton onUploaded={(u)=>setFileUrl(u)} />
        {fileUrl && <p>Archivo listo: {fileUrl}</p>}
        <form onSubmit={submit}>
          <input placeholder="Ledger ID (opcional)" value={ledgerId} onChange={e=>setLedgerId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <input placeholder="Group ID (opcional)" value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <input placeholder="Monto" value={amount} onChange={e=>setAmount(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="Concepto" value={concept} onChange={e=>setConcept(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <button>Guardar evidencia</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
