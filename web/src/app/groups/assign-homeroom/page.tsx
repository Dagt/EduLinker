"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function AssignHomeroom() {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("AssignHomeroom.unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPatch(`/groups/${groupId}/assign-homeroom-teacher/`, { homeroom_teacher: Number(teacherId) }, tk);
      setMsg(t("AssignHomeroom.assigned"));
      setGroupId("");
      setTeacherId("");
    } catch (err: any) {
      setMsg(t("AssignHomeroom.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("AssignHomeroom.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("AssignHomeroom.header")}</h2>
            <p className="subtle">
              {t("AssignHomeroom.subtitle", { defaultValue: "Asigna el docente titular del grupo." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("AssignHomeroom.groupId")}
              <input
                placeholder={t("AssignHomeroom.groupId")}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </label>
            <label>
              {t("AssignHomeroom.teacherId")}
              <input
                placeholder={t("AssignHomeroom.teacherId")}
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("AssignHomeroom.assign")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
