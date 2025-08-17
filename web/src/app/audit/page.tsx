"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

interface AuditLog {
  actor: string;
  action: string;
  entity_type: string;
  created_at: string;
}

export default function AuditPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [actor, setActor] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pageSize),
        });
        if (actor) params.append("actor", actor);
        if (actionFilter) params.append("action", actionFilter);
        if (entityType) params.append("entity_type", entityType);
        if (dateFrom) params.append("date_from", dateFrom);
        if (dateTo) params.append("date_to", dateTo);
        const data = await apiGet<any>(`/audit-logs/?${params.toString()}`, tk);
        const results = data.results || data;
        setLogs(results);
        setTotal(data.count || results.length);
      } catch (err: any) {
        setError(err.message || t("AuditLogs.error"));
      }
    }
    load();
  }, [page, actor, actionFilter, entityType, dateFrom, dateTo, t]);

  if (!requireRole(["director"])) return <p>{t("AuditLogs.unauthorized")}</p>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("AuditLogs.header")}</h2>
        {error && <p>{error}</p>}
        <div style={{ marginBottom: 16 }}>
          <input
            placeholder={t("AuditLogs.actor")}
            value={actor}
            onChange={(e) => {
              setActor(e.target.value);
              setPage(1);
            }}
            style={{ marginRight: 8 }}
          />
          <input
            placeholder={t("AuditLogs.action")}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{ marginRight: 8 }}
          />
          <input
            placeholder={t("AuditLogs.entityType")}
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            style={{ marginRight: 8 }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            style={{ marginRight: 8 }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            style={{ marginRight: 8 }}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>{t("AuditLogs.actor")}</th>
              <th>{t("AuditLogs.action")}</th>
              <th>{t("AuditLogs.entityType")}</th>
              <th>{t("AuditLogs.createdAt")}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.actor}</td>
                <td>{log.action}</td>
                <td>{log.entity_type}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16 }}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </main>
    </>
  );
}

