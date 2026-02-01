"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function AssignVocal() {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState("");
  const [parentId, setParentId] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("AssignVocal.unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost(`/groups/vocal-assignments/`, { group: Number(groupId), parent: Number(parentId) }, tk);
      setMsg(t("AssignVocal.assigned"));
      setGroupId("");
      setParentId("");
    } catch (err: any) {
      setMsg(t("AssignVocal.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("AssignVocal.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("AssignVocal.header")}</h2>
            <p className="subtle">
              {t("AssignVocal.subtitle", { defaultValue: "Designa un vocal por grupo." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={submit}>
            <label>
              {t("AssignVocal.groupId")}
              <input
                placeholder={t("AssignVocal.groupId")}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </label>
            <label>
              {t("AssignVocal.parentId")}
              <input
                placeholder={t("AssignVocal.parentId")}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("AssignVocal.assign")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
