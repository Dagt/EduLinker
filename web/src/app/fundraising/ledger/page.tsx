"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";

export default function FundraisingLedger(){
  const [eventId,setEventId]=useState("");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [notes,setNotes]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      const res = await apiPost("/fundraising-ledger/", {
        event_id: Number(eventId),
        group_id: Number(groupId),
        amount_collected: Number(amount),
        notes
      }, tk);
      setMsg(`Registro agregado #${res.id}`);
      setAmount(""); setNotes("");
    }catch(e:any){ setMsg(e.message || "Error al registrar"); }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>Registrar recaudación por grupo</h2>
        <form onSubmit={submit}>
          <input placeholder="Event ID" value={eventId} onChange={e=>setEventId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="Group ID" value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="Monto" value={amount} onChange={e=>setAmount(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <textarea placeholder="Notas" value={notes} onChange={e=>setNotes(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:100}}/>
          <button>Guardar</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
