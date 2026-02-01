"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ResetPasswordRequestPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await requestPasswordReset({ email });
      setMessage(t("ResetPasswordRequest.success"));
      setEmail("");
    } catch (err: any) {
      setError(err.message || t("ResetPasswordRequest.error"));
    }
  };

  return (
    <main className="page narrow">
      <header className="page-header compact">
        <div>
          <span className="pill">{t("ResetPasswordRequest.pill", { defaultValue: "Acceso" })}</span>
          <h1>{t("ResetPasswordRequest.header")}</h1>
          <p className="subtle">
            {t("ResetPasswordRequest.subtitle", { defaultValue: "Te enviaremos un enlace para restablecer la clave." })}
          </p>
        </div>
      </header>
      <section className="card">
        <form className="form" onSubmit={submit} aria-labelledby="reset-request-title">
          <label>
            {t("ResetPasswordRequest.email")}
            <input
              aria-label={t("ResetPasswordRequest.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <div className="form-actions">
            <button className="button" type="submit">{t("ResetPasswordRequest.submit")}</button>
          </div>
          {message && <p className="alert success" role="status">{message}</p>}
          {error && <p className="alert error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
