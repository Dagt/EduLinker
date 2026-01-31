"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setToken, setRefreshToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
import { setUserRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import Link from "next/link";
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
    try {
      const me = await getMe(data.access);
      if (me?.role) setUserRole(me.role);
    } catch {}
    location.href = "/dashboard";
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <span className="pill">EduLinker</span>
        <h1>{t("Login.title")}</h1>
        <p className="subtle">
          {t("Login.subtitle", { defaultValue: "Acceso para dirección, docentes y familias." })}
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            {t("Login.email")}
            <input
              placeholder={t("Login.email")}
              {...register("email", {
                required: t('Validation.required'),
                pattern: { value: /\S+@\S+\.\S+/, message: t('Validation.invalidEmail') }
              })}
            />
          </label>
          {errors.email && <p className="error">{errors.email.message as string}</p>}
          <label>
            {t("Login.password")}
            <input
              placeholder={t("Login.password")}
              type="password"
              {...register("password", { required: t('Validation.required') })}
            />
          </label>
          {errors.password && <p className="error">{errors.password.message as string}</p>}
          <button className="primary" type="submit">{t("Login.login")}</button>
          <p className="reset">
            <Link href="/reset-password/request">{t("Login.resetPassword")}</Link>
          </p>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 2rem;
        }
        .login-card {
          width: min(420px, 92vw);
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 2rem;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4);
          backdrop-filter: blur(14px);
        }
        h1 {
          margin: 0.75rem 0 0.25rem;
        }
        form {
          display: grid;
          gap: 0.9rem;
          margin-top: 1.25rem;
        }
        label {
          display: grid;
          gap: 0.4rem;
          font-size: 0.9rem;
          color: #e2e8f0;
        }
        .primary {
          background: linear-gradient(135deg, #38bdf8, #f59e0b);
          border: none;
          color: #0b1020;
          font-weight: 700;
        }
        .reset {
          margin: 0.25rem 0 0;
          color: #cbd5f5;
        }
        .reset :global(a) {
          color: #fef3c7;
          text-decoration: underline;
        }
        .error {
          color: #fecaca;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.35);
          border-radius: 12px;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
