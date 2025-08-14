"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";

export default function Dashboard(){
  const [me,setMe]=useState<any>(); const [kpis,setKpis]=useState<any>();
  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const m = await apiGet<any>("/me/", tk);
    const k = await apiGet<any>("/analytics/overview/", tk);
    setMe(m); setKpis(k);
  })(); },[]);
  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>Bienvenido, {me?.first_name} {me?.last_name}</h2>
        <pre>{JSON.stringify(kpis,null,2)}</pre>
      </main>
    </>
  );
}
