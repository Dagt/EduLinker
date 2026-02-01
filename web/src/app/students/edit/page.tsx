"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { apiGet, updateStudent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function StudentEdit() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    grade_level: "",
    enrollment_code: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const tk = getToken();
        const data = await apiGet(`/students/${id}/`, tk);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          grade_level: String(data.grade_level ?? ""),
          enrollment_code: data.enrollment_code || "",
        });
      } catch {
        setMsg(t("StudentEdit.error"));
      }
    }
    load();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setMsg("");
    try {
      const tk = getToken();
      await updateStudent(
        Number(id),
        {
          first_name: form.first_name,
          last_name: form.last_name,
          grade_level: Number(form.grade_level),
          enrollment_code: form.enrollment_code,
        },
        tk,
      );
      setMsg(t("StudentEdit.updated"));
    } catch (err: any) {
      setMsg(t("StudentEdit.error"));
    }
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("StudentEdit.pill", { defaultValue: "Estudiantes" })}</span>
            <h2>{t("StudentEdit.header")}</h2>
            <p className="subtle">
              {t("StudentEdit.subtitle", { defaultValue: "Actualiza la ficha del estudiante." })}
            </p>
          </div>
        </header>
        {!id ? (
          <p className="alert error">{t("StudentEdit.missingId")}</p>
        ) : (
          <section className="card">
            <form className="form" onSubmit={submit}>
              <label>
                {t("StudentEdit.firstName")}
                <input
                  placeholder={t("StudentEdit.firstName")}
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </label>
              <label>
                {t("StudentEdit.lastName")}
                <input
                  placeholder={t("StudentEdit.lastName")}
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </label>
              <label>
                {t("StudentEdit.grade")}
                <input
                  placeholder={t("StudentEdit.grade")}
                  value={form.grade_level}
                  onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                />
              </label>
              <label>
                {t("StudentEdit.enrollment")}
                <input
                  placeholder={t("StudentEdit.enrollment")}
                  value={form.enrollment_code}
                  onChange={(e) => setForm({ ...form, enrollment_code: e.target.value })}
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("StudentEdit.update")}</button>
              </div>
            </form>
          </section>
        )}
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </RequireRole>
  );
}
