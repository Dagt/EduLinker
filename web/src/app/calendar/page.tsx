"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";

export default function Calendar(){
  const [events,setEvents]=useState<any[]>([]);
  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const list = await apiGet<any[]>("/events/", tk);
    setEvents(list);
  })(); },[]);
  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>Calendario</h2>
        <ul>{events.map(e=>(<li key={e.id}>{e.title} — {new Date(e.start_at).toLocaleString()}</li>))}</ul>
      </main>
    </>
  );
}
