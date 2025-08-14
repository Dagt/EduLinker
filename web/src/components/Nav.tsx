"use client";
import Link from "next/link";

export default function Nav(){
  return (
    <nav style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"}}>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/calendar">Calendario</Link>
      <Link href="/complaints">Quejas</Link>
      <Link href="/suggestions">Sugerencias</Link>
      <Link href="/surveys">Encuestas</Link>
      <Link href="/fundraising">Recaudación</Link>
    </nav>
  );
}
