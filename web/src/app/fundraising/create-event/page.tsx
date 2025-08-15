"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";

export default function FundraisingCreateEvent(){
  const [name,setName]=useState(""); const [date,setDate]=useState("");
  const [description,setDescription]=useState(""); const [msg,setMsg]=useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      const body = { name, date, description }; // school_year se resuelve en backend si lo implementaste así; si no, añade el ID
      const res = await apiPost("/fundraising-events/", body, tk);
      setMsg(`Evento creado #${res.id}`);
      setName(""); setDate(""); setDescription("");
    }catch(e:any){ setMsg(e.message || "Error al crear evento"); }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>Crear evento de recaudación</h2>
        <form onSubmit={submit}>
          <input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="Fecha (YYYY-MM-DD)" value={date} onChange={e=>setDate(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <textarea placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
          <button>Crear evento</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
