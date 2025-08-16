"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function AssignSpecialist() {
  const t = useTranslations("AssignSpecialist");
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost(`/groups/${groupId}/assign-specialist/`, { teacher: Number(teacherId), subject }, tk);
      setMsg(t("assigned"));
      setGroupId("");
      setTeacherId("");
      setSubject("");
    } catch (err: any) {
      setMsg(t("error"));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        <form onSubmit={submit}>
          <input
            placeholder={t("groupId")}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("teacherId")}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("subject")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("assign")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
