"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n";

type Complaint = {
  id: number;
  group?: number;
  status: string;
  description: string;
  created_at: string;
};

function extractResults(payload: any): Complaint[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results as Complaint[];
  return [];
}

export default function ComplaintsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Complaint[]>([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  async function load() {
    try {
      const tk = getToken();
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (groupFilter) params.set("group_id", groupFilter);
      const query = params.toString();
      const res = await apiGet<any>(`/complaints/${query ? `?${query}` : ""}`, tk);
      setItems(extractResults(res));
    } catch (err: any) {
      setError(err?.message || t("Complaints.error", { defaultValue: "Error al cargar incidencias." }));
    }
  }

  useEffect(() => {
    load();
  }, [t]);

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Complaints.pill", { defaultValue: "Confidencial" })}</span>
            <h2>{t("Complaints.title", { defaultValue: "Incidencias" })}</h2>
            <p className="subtle">
              {t("Complaints.subtitle", { defaultValue: "Seguimiento de casos y comunicación con docentes." })}
            </p>
          </div>
          <Link className="button" href="/complaints/create">
            {t("Complaints.create", { defaultValue: "Nueva incidencia" })}
          </Link>
        </header>

        {error && <p className="alert error">{error}</p>}

        <section className="card form">
          <form className="form-inline" onSubmit={(e) => { e.preventDefault(); load(); }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">{t("Complaints.filterAll", { defaultValue: "Todos los estados" })}</option>
              <option value="OPEN">{t("Complaints.statusOpen", { defaultValue: "Abierta" })}</option>
              <option value="IN_REVIEW">{t("Complaints.statusInReview", { defaultValue: "En revision" })}</option>
              <option value="ESCALATED">{t("Complaints.statusEscalated", { defaultValue: "Escalada" })}</option>
              <option value="RESOLVED">{t("Complaints.statusResolved", { defaultValue: "Resuelta" })}</option>
              <option value="CLOSED">{t("Complaints.statusClosed", { defaultValue: "Cerrada" })}</option>
            </select>
            <input
              placeholder={t("Complaints.filterGroup", { defaultValue: "ID de grupo" })}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            />
            <button className="button" type="submit">
              {t("Complaints.applyFilters", { defaultValue: "Aplicar" })}
            </button>
          </form>
        </section>

        <section className="grid cards">
          {items.length === 0 && !error && (
            <div className="card empty">
              <h3>{t("Complaints.emptyTitle", { defaultValue: "Sin incidencias aún" })}</h3>
              <p className="subtle">
                {t("Complaints.emptyBody", { defaultValue: "Crea la primera para iniciar el registro." })}
              </p>
            </div>
          )}
          {items.map((c) => (
            <article key={c.id} className="card">
              <div className="card-header">
                <span className="chip">{c.status}</span>
                <span className="meta">#{c.id}</span>
              </div>
              <p className="card-title">
                {c.description?.slice(0, 120) || t("Complaints.noDescription", { defaultValue: "Sin descripción." })}
              </p>
              <div className="card-footer">
                <span className="meta">
                  {c.group ? `Grupo ${c.group}` : t("Complaints.noGroup", { defaultValue: "Grupo sin asignar" })}
                </span>
                <Link className="link" href={`/complaints/${c.id}`}>
                  {t("Complaints.view", { defaultValue: "Ver detalle" })}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
