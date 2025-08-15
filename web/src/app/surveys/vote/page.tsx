"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { voteSurvey } from "@/lib/api";
import { requireRole } from "@/lib/roles";

export default function SurveyVote(){
  const [id,setId]=useState("");
  const [choice,setChoice]=useState("");
  const [msg,setMsg]=useState("");

  if(!requireRole(["admin","student","teacher"])) return <p>No autorizado</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk=getToken();
      await voteSurvey(Number(id), Number(choice), tk);
      setMsg("Voto registrado");
      setId(""); setChoice("");
    }catch(err:any){ setMsg(err.message || "Error"); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>Votar encuesta</h2>
      <form onSubmit={submit}>
        <input placeholder="ID encuesta" value={id} onChange={e=>setId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder="ID opción" value={choice} onChange={e=>setChoice(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>Votar</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}
