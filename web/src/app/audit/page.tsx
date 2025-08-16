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

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const data = await apiGet<any>(`/audit-logs/?page=${page}&page_size=${pageSize}`, tk);
        const results = data.results || data;
        setLogs(results);
        setTotal(data.count || results.length);
      } catch (err: any) {
        setError(err.message || t("AuditLogs.error"));
      }
    }
    load();
  }, [page, t]);

  if (!requireRole(["director"])) return <p>{t("AuditLogs.unauthorized")}</p>;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("AuditLogs.header")}</h2>
        {error && <p>{error}</p>}
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

