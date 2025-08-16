"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function GroupList() {
  const t = useTranslations("GroupList");
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const data = await apiGet<any[]>("/groups/", tk);
        setGroups(data);
      } catch (err: any) {
        setError(err.message || t("error"));
      }
    }
    load();
  }, []);

  if (!requireRole(["admin"])) return <p>{t("unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        {error && <p>{error}</p>}
        <ul>
          {groups.map((g) => (
            <li key={g.id}>{g.name}</li>
          ))}
        </ul>
      </main>
    </>
  );
}
