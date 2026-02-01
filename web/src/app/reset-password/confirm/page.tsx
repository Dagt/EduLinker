"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ResetPasswordConfirmPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError(t("ResetPasswordConfirm.mismatch"));
      return;
    }
    try {
      await confirmPasswordReset({ uid, token, new_password: password });
      setMessage(t("ResetPasswordConfirm.success"));
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err.message || t("ResetPasswordConfirm.error"));
    }
  };

  return (
    <main className="page narrow">
      <header className="page-header compact">
        <div>
          <span className="pill">{t("ResetPasswordConfirm.pill", { defaultValue: "Acceso" })}</span>
          <h1>{t("ResetPasswordConfirm.header")}</h1>
          <p className="subtle">
            {t("ResetPasswordConfirm.subtitle", { defaultValue: "Define una nueva contrasena segura." })}
          </p>
        </div>
      </header>
      <section className="card">
        <form className="form" onSubmit={submit} aria-labelledby="reset-confirm-title">
          <label>
            {t("ResetPasswordConfirm.password")}
            <input
              aria-label={t("ResetPasswordConfirm.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          <label>
            {t("ResetPasswordConfirm.confirm")}
            <input
              aria-label={t("ResetPasswordConfirm.confirm")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              required
            />
          </label>
          <div className="form-actions">
            <button className="button" type="submit">{t("ResetPasswordConfirm.submit")}</button>
          </div>
          {message && <p className="alert success" role="status">{message}</p>}
          {error && <p className="alert error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
