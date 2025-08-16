"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function GroupCreate() {
  const t = useTranslations("GroupCreate");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [msg, setMsg] = useState("");

  if (!requireRole(["admin"])) return <p>{t("unauthorized")}</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost("/groups/create/", { name, grade_level: Number(grade) }, tk);
      setMsg(t("created"));
      setName("");
      setGrade("");
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
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <input
            placeholder={t("grade")}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <button>{t("create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
