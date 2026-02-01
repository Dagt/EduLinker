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
        <div className="brand">
          <span className="brand-mark">EL</span>
          <div>
            <h1>{t("Login.title")}</h1>
            <p className="subtle">
              {t("Login.subtitle", { defaultValue: "Acceso para dirección, docentes y familias." })}
            </p>
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            {t("Login.email")}
            <input
              placeholder={t("Login.email")}
              {...register("email", {
                required: t("Validation.required"),
                pattern: { value: /\S+@\S+\.\S+/, message: t("Validation.invalidEmail") },
              })}
            />
          </label>
          {errors.email && <p className="alert error">{errors.email.message as string}</p>}
          <label>
            {t("Login.password")}
            <input
              placeholder={t("Login.password")}
              type="password"
              {...register("password", { required: t("Validation.required") })}
            />
          </label>
          {errors.password && <p className="alert error">{errors.password.message as string}</p>}
          <button className="button primary" type="submit">
            {t("Login.login")}
          </button>
          <p className="reset">
            <Link href="/reset-password/request">{t("Login.resetPassword")}</Link>
          </p>
          {error && <p className="alert error">{error}</p>}
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
          width: min(520px, 92vw);
          background: var(--panel-strong);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 2.25rem;
          box-shadow: var(--shadow);
          backdrop-filter: blur(14px);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .brand-mark {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fefdfb;
        }
        h1 {
          margin: 0 0 0.35rem;
        }
        .reset {
          margin: 0.25rem 0 0;
          color: var(--ink-soft);
        }
        .reset :global(a) {
          color: var(--accent);
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
