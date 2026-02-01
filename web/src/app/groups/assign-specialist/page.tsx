"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function AssignSpecialist() {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("AssignSpecialist.unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost(`/groups/${groupId}/assign-specialist/`, { teacher: Number(teacherId), subject }, tk);
      setMsg(t("AssignSpecialist.assigned"));
      setGroupId("");
      setTeacherId("");
      setSubject("");
    } catch (err: any) {
      setMsg(t("AssignSpecialist.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("AssignSpecialist.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("AssignSpecialist.header")}</h2>
            <p className="subtle">
              {t("AssignSpecialist.subtitle", { defaultValue: "Asigna docentes por materia." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("AssignSpecialist.groupId")}
              <input
                placeholder={t("AssignSpecialist.groupId")}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </label>
            <label>
              {t("AssignSpecialist.teacherId")}
              <input
                placeholder={t("AssignSpecialist.teacherId")}
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />
            </label>
            <label>
              {t("AssignSpecialist.subject")}
              <input
                placeholder={t("AssignSpecialist.subject")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("AssignSpecialist.assign")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
