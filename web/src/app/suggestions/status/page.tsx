"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { updateSuggestionStatus } from "@/lib/api";
import { requireRole } from "@/lib/roles";

export default function SuggestionStatus(){
  const [id,setId]=useState("");
  const [status,setStatus]=useState("");
  const [msg,setMsg]=useState("");

  if(!requireRole(["admin","teacher"])) return <p>No autorizado</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      await updateSuggestionStatus(Number(id), status, tk);
      setMsg("Estado actualizado");
      setId(""); setStatus("");
    }catch(err:any){ setMsg(err.message || "Error"); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>Actualizar estado de sugerencia</h2>
      <form onSubmit={submit}>
        <input placeholder="ID" value={id} onChange={e=>setId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder="Estado" value={status} onChange={e=>setStatus(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>Actualizar</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
