"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type FormData = { email: string; password: string };

export default function Login(){
  const { register, handleSubmit, formState:{ errors } } = useForm<FormData>();
  const [error,setError]=useState("");
  const t = useTranslations("Login");

  async function onSubmit({ email, password }: FormData){
    setError("");
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder={t("email")}
          {...register("email", { required: true })}
          style={{width:"100%", padding:8, margin:"8px 0"}}
        />
        {errors.email && <p style={{color:"red"}}>Required</p>}
        <input
          placeholder={t("password")}
          type="password"
          {...register("password", { required: true })}
          style={{width:"100%", padding:8, margin:"8px 0"}}
        />
        {errors.password && <p style={{color:"red"}}>Required</p>}
        <button style={{padding:10, width:"100%"}}>{t("login")}</button>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </main>
  );
}
