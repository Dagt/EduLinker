"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { createStudent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function StudentCreate() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    grade_level: "",
    enrollment_code: "",
  });
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await createStudent(
        {
          ...form,
          grade_level: Number(form.grade_level),
        },
        tk,
      );
      setMsg(t("StudentCreate.created"));
      setForm({ first_name: "", last_name: "", grade_level: "", enrollment_code: "" });
    } catch (err: any) {
      setMsg(t("StudentCreate.error"));
    }
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("StudentCreate.header")}</h2>
        <form onSubmit={submit} style={{ maxWidth: 480 }}>
          <input
            placeholder={t("StudentCreate.firstName")}
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("StudentCreate.lastName")}
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("StudentCreate.grade")}
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("StudentCreate.enrollment")}
            value={form.enrollment_code}
            onChange={(e) => setForm({ ...form, enrollment_code: e.target.value })}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("StudentCreate.create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </RequireRole>
  );
}
