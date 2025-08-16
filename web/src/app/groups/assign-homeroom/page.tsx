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
      <main style={{ padding: 16 }}>
        <h2>{t("AssignHomeroom.header")}</h2>
        <form onSubmit={submit}>
          <input
            placeholder={t("AssignHomeroom.groupId")}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("AssignHomeroom.teacherId")}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("AssignHomeroom.assign")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
