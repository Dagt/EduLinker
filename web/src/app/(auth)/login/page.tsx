"use client";
import { useState } from "react";
import { setToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

export default function Login(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const t = useTranslations("Login");
  async function submit(e: React.FormEvent){
    e.preventDefault(); setError("");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,{
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-School-ID": process.env.NEXT_PUBLIC_SCHOOL_ID || "1" },
      body: JSON.stringify({ username: email, password })
    });
    if(!res.ok){ setError(t("invalid")); return; }
    const data = await res.json();
    setToken(data.access);
    location.href = "/dashboard";
  }
  return (
    <main style={{maxWidth:360, margin:"48px auto"}}>
      <h1>{t("title")}</h1>
      <form onSubmit={submit}>
        <input placeholder={t("email")} onChange={e=>setEmail(e.target.value)} style={{width:"100%", padding:8, margin:"8px 0"}}/>
        <input placeholder={t("password")} type="password" onChange={e=>setPassword(e.target.value)} style={{width:"100%", padding:8, margin:"8px 0"}}/>
        <button style={{padding:10, width:"100%"}}>{t("login")}</button>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </main>
  );
}
