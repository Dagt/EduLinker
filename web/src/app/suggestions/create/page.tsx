"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";

export default function CreateSuggestion(){
  const [groupId,setGroupId]=useState<string>("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      await apiPost("/suggestions/", { group: groupId ? Number(groupId): null, title, description }, tk);
      setMsg("Sugerencia creada");
      setGroupId(""); setTitle(""); setDescription("");
    }catch(err:any){ setMsg(err.message || "Error"); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>Crear sugerencia</h2>
      <form onSubmit={submit}>
        <input placeholder="Group ID (opcional)" value={groupId} onChange={e=>setGroupId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <textarea placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)}
                  style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}}/>
        <button>Crear</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
