"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setToken, setRefreshToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type FormData = { email: string; password: string };

export default function Login(){
  const { t } = useTranslation();
  const { register, handleSubmit, formState:{ errors } } = useForm<FormData>();
  const [error,setError]=useState("");

  async function onSubmit({ email, password }: FormData){
    setError("");
    if(typeof window !== 'undefined' && !window.confirm(t('Login.confirm'))) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,{
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-School-ID": process.env.NEXT_PUBLIC_SCHOOL_ID || "1" },
      body: JSON.stringify({ username: email, password })
    });
    if(!res.ok){ setError(t("Login.invalid")); return; }
    const data = await res.json();
    setToken(data.access);
    if(data.refresh) setRefreshToken(data.refresh);
    location.href = "/dashboard";
  }

  return (
    <main style={{maxWidth:360, margin:"48px auto"}}>
      <h1>{t("Login.title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder={t("Login.email")}
          {...register("email", {
            required: t('Validation.required'),
            pattern: { value: /\S+@\S+\.\S+/, message: t('Validation.invalidEmail') }
          })}
          style={{width:"100%", padding:8, margin:"8px 0"}}
        />
        {errors.email && <p style={{color:"red"}}>{errors.email.message as string}</p>}
        <input
          placeholder={t("Login.password")}
          type="password"
          {...register("password", { required: t('Validation.required') })}
          style={{width:"100%", padding:8, margin:"8px 0"}}
        />
        {errors.password && <p style={{color:"red"}}>{errors.password.message as string}</p>}
        <button style={{padding:10, width:"100%"}}>{t("Login.login")}</button>
        {error && <p style={{color:"red"}}>{error}</p>}
      </form>
    </main>
  );
}
