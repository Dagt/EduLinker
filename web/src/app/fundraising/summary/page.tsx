"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { getFundraisingSummary } from "@/lib/api";
import { requireRole } from "@/lib/roles";

export default function FundraisingSummary(){
  const [data,setData]=useState<any[]>([]);
  useEffect(()=>{ (async()=>{
    try{
      const tk=getToken();
      const r=await getFundraisingSummary(tk);
      setData(r);
    }catch(err){ console.error(err); }
  })(); },[]);

  if(!requireRole(["admin","treasurer"])) return <p>No autorizado</p>;

  return (<>
    <Nav/>
    <main style={{padding:16}}>
      <h2>Resumen de recaudación</h2>
      <ul>
        {data.map((x,i)=>(<li key={i}>{x.name}: {x.total}</li>))}
      </ul>
    </main>
  </>);
}
