"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import UploadButton from "@/components/UploadButton";
import { apiPost } from "@/lib/api";

export default function Calendar(){
  const [events,setEvents]=useState<any[]>([]);
  const [lastUrl,setLastUrl]=useState("");

  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const list = await apiGet<any[]>("/events/", tk);
    setEvents(list);
  })(); },[]);

  async function attachToEvent(eventId:number, fileUrl:string){
    const tk = getToken();
    await apiPost(`/events/${eventId}/attachments/`, { file_url: fileUrl, filename: fileUrl.split("/").pop(), mime_type: "" }, tk);
    alert("Adjunto agregado");
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>Calendario</h2>
        <UploadButton onUploaded={(u)=>setLastUrl(u)} />
        {lastUrl && <p>Subido: {lastUrl}</p>}
        <ul>
          {events.map(e=>(
            <li key={e.id}>
              {e.title} — {new Date(e.start_at).toLocaleString()} {" "}
              {lastUrl && <button onClick={()=>attachToEvent(e.id,lastUrl)}>Adjuntar último archivo</button>}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}