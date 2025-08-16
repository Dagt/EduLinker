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
      <main style={{ padding: 16 }}>
        <h2>{t("AssignVocal.header")}</h2>
        <form onSubmit={submit}>
          <input
            placeholder={t("AssignVocal.groupId")}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("AssignVocal.parentId")}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("AssignVocal.assign")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
