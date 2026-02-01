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
        const data = await apiGet<any>("/groups/", tk);
        const list = Array.isArray(data) ? data : data?.results || [];
        setGroups(list);
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
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("GroupList.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("GroupList.header")}</h2>
            <p className="subtle">{t("GroupList.subtitle", { defaultValue: "Administra grupos y asignaciones." })}</p>
          </div>
          <Link className="button secondary" href="/groups/create">
            {t("GroupList.create")}
          </Link>
        </header>
        <section className="card form">
          <input
            placeholder={t("GroupList.filterPlaceholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </section>
        {error && <p className="alert error">{error}</p>}
        <section className="grid cards">
          {visibleGroups.map((g) => (
            <article key={g.id} className="card">
              <div className="card-header">
                <span className="chip">#{g.id}</span>
              </div>
              <p className="card-title">{g.name}</p>
              <div className="card-footer">
                <span className="meta">{t("GroupList.grade", { defaultValue: "Grado" })}: {g.grade_level}</span>
                <Link className="link" href={`/groups/${g.id}`}>{t("GroupList.view", { defaultValue: "Ver detalle" })}</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </RequireRole>
  );
}
