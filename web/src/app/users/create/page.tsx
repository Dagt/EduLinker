"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { createUser } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function UserCreate() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "DIRECTOR",
    password: "",
  });
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await createUser(form, tk);
      setMsg(t("UserCreate.created"));
      setForm({ first_name: "", last_name: "", email: "", role: "DIRECTOR", password: "" });
    } catch (err: any) {
      setMsg(t("UserCreate.error"));
    }
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("UserCreate.header")}</h2>
        <form onSubmit={submit} style={{ maxWidth: 480 }}>
          <input
            placeholder={t("UserCreate.firstName")}
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("UserCreate.lastName")}
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("UserCreate.email")}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          >
            <option value="DIRECTOR">{t("UserCreate.roleDirector")}</option>
            <option value="MAESTRO_TITULAR">{t("UserCreate.roleHomeroom")}</option>
            <option value="MAESTRO_ITINERANTE">{t("UserCreate.roleSpecialist")}</option>
            <option value="PADRE">{t("UserCreate.roleParent")}</option>
            <option value="VOCAL">{t("UserCreate.roleVocal")}</option>
          </select>
          <input
            placeholder={t("UserCreate.password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("UserCreate.create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </RequireRole>
  );
}
