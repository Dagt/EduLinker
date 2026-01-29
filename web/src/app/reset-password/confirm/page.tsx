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
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1>{t("ResetPasswordConfirm.header")}</h1>
      <form onSubmit={submit} aria-labelledby="reset-confirm-title" style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>{t("ResetPasswordConfirm.password")}</span>
          <input
            aria-label={t("ResetPasswordConfirm.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ padding: 8 }}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>{t("ResetPasswordConfirm.confirm")}</span>
          <input
            aria-label={t("ResetPasswordConfirm.confirm")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            required
            style={{ padding: 8 }}
          />
        </label>
        <button type="submit">{t("ResetPasswordConfirm.submit")}</button>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
