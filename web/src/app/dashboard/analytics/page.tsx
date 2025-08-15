"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { getAnalytics } from "@/lib/api";
import { requireRole } from "@/lib/roles";

export default function AnalyticsDashboard(){
  const [stats,setStats]=useState<any>(null);
  useEffect(()=>{ (async()=>{
    try{
      const tk=getToken();
      const r=await getAnalytics(tk);
      setStats(r);
    }catch(err){ console.error(err); }
  })(); },[]);

  if(!requireRole(["admin"])) return <p>No autorizado</p>;

  return (<>
    <Nav/>
    <main style={{padding:16}}>
      <h2>Dashboard Analítico</h2>
      <pre>{JSON.stringify(stats,null,2)}</pre>
    </main>
  </>);
}
