"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function GroupEdit() {
  const { t } = useTranslation();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("GroupEdit.unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPatch(`/groups/${id}/`, { name, grade_level: Number(grade) }, tk);
      setMsg(t("GroupEdit.updated"));
      setId("");
      setName("");
      setGrade("");
    } catch (err: any) {
      setMsg(t("GroupEdit.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("GroupEdit.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("GroupEdit.header")}</h2>
            <p className="subtle">
              {t("GroupEdit.subtitle", { defaultValue: "Actualiza la informacion del grupo." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("GroupEdit.groupId")}
              <input
                placeholder={t("GroupEdit.groupId")}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>
            <label>
              {t("GroupEdit.name")}
              <input
                placeholder={t("GroupEdit.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t("GroupEdit.grade")}
              <input
                placeholder={t("GroupEdit.grade")}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("GroupEdit.update")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
