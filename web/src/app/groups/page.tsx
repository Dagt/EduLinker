"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function GroupList() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const data = await apiGet<any[]>("/groups/", tk);
        setGroups(data);
      } catch (err: any) {
        setError(err.message || t("GroupList.error"));
      }
    }
    load();
  }, []);

  if (!requireRole(["admin"])) return <p>{t("GroupList.unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("GroupList.header")}</h2>
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
