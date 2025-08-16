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
      <main style={{ padding: 16 }}>
        <h2>{t("AssignSpecialist.header")}</h2>
        <form onSubmit={submit}>
          <input
            placeholder={t("AssignSpecialist.groupId")}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("AssignSpecialist.teacherId")}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("AssignSpecialist.subject")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("AssignSpecialist.assign")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
