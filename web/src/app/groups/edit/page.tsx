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
      <main style={{ padding: 16 }}>
        <h2>{t("GroupEdit.header")}</h2>
        <form onSubmit={submit}>
          <input
            placeholder={t("GroupEdit.groupId")}
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("GroupEdit.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("GroupEdit.grade")}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("GroupEdit.update")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
