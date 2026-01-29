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
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1>{t("ResetPasswordRequest.header")}</h1>
      <form onSubmit={submit} aria-labelledby="reset-request-title" style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>{t("ResetPasswordRequest.email")}</span>
          <input
            aria-label={t("ResetPasswordRequest.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ padding: 8 }}
          />
        </label>
        <button type="submit">{t("ResetPasswordRequest.submit")}</button>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
