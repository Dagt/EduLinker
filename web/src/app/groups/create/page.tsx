"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function GroupCreate() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("GroupCreate.unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost("/groups/create/", { name, grade_level: Number(grade) }, tk);
      setMsg(t("GroupCreate.created"));
      setName("");
      setGrade("");
    } catch (err: any) {
      setMsg(t("GroupCreate.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("GroupCreate.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("GroupCreate.header")}</h2>
            <p className="subtle">
              {t("GroupCreate.subtitle", { defaultValue: "Crea un grupo y asigna su grado." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("GroupCreate.name")}
              <input
                placeholder={t("GroupCreate.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t("GroupCreate.grade")}
              <input
                placeholder={t("GroupCreate.grade")}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("GroupCreate.create")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
