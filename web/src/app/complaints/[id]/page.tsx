"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";

export default function ComplaintThread({ params }: { params: { id: string } }){
  const id = Number(params.id);
  const [complaint,setComplaint]=useState<any>();
  const [text,setText]=useState("");
  const [msg,setMsg]=useState("");

  async function load(){
    try{
      const tk = getToken();
      const data = await apiGet<any>(`/complaints/${id}/`, tk);
      setComplaint(data);
    }catch(e:any){ setMsg(e.message || "No se pudo cargar la queja"); }
  }

  async function send(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      await apiPost(`/complaints/${id}/messages/`, { message: text, attachments: [] }, tk);
      setText(""); await load();
    }catch(e:any){ setMsg(e.message || "No se pudo enviar"); }
  }

  useEffect(()=>{ load(); },[id]);

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:780}}>
        <h2>Queja #{id}</h2>
        {complaint ? (
          <>
            <p><b>Status:</b> {complaint.status}</p>
            <p><b>Descripción:</b> {complaint.description}</p>
            <h3>Mensajes</h3>
            <ul>
              {complaint.messages?.map((m:any)=>(
                <li key={m.id} style={{marginBottom:8}}>
                  <div><b>{m.author}</b> — {new Date(m.created_at).toLocaleString()}</div>
                  <div>{m.message}</div>
                </li>
              ))}
            </ul>
            <form onSubmit={send} style={{marginTop:12}}>
              <textarea value={text} onChange={e=>setText(e.target.value)}
                        placeholder="Escribe una respuesta"
                        style={{display:"block",width:"100%",minHeight:120,margin:"8px 0",padding:8}}/>
              <button>Enviar</button>
            </form>
          </>
        ) : <p>Cargando…</p>}
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
