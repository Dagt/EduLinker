"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

export default function GroupList() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
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

  const visibleGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("GroupList.header")}</h2>
        <p>
          <Link href="/groups/create">{t("GroupList.create")}</Link>
        </p>
        <input
          placeholder={t("GroupList.filterPlaceholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
        />
        {error && <p>{error}</p>}
        <ul>
          {visibleGroups.map((g) => (
            <li key={g.id}>
              <Link href={`/groups/${g.id}`}>{g.name}</Link>
            </li>
          ))}
        </ul>
      </main>
    </RequireRole>
  );
}
