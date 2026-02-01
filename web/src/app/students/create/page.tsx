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
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("StudentCreate.pill", { defaultValue: "Estudiantes" })}</span>
            <h2>{t("StudentCreate.header")}</h2>
            <p className="subtle">
              {t("StudentCreate.subtitle", { defaultValue: "Registra estudiantes y genera su codigo de inscripcion." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("StudentCreate.firstName")}
              <input
                placeholder={t("StudentCreate.firstName")}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </label>
            <label>
              {t("StudentCreate.lastName")}
              <input
                placeholder={t("StudentCreate.lastName")}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </label>
            <label>
              {t("StudentCreate.grade")}
              <input
                placeholder={t("StudentCreate.grade")}
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
              />
            </label>
            <label>
              {t("StudentCreate.enrollment")}
              <input
                placeholder={t("StudentCreate.enrollment")}
                value={form.enrollment_code}
                onChange={(e) => setForm({ ...form, enrollment_code: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("StudentCreate.create")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </RequireRole>
  );
}
