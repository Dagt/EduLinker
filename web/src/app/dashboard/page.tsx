"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Card from "@/components/Card";
import { getToken, clearToken, clearRefreshToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DashboardContent() {
  const [me, setMe] = useState<any>();
  const [kpis, setKpis] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const tk = getToken();
      if (!tk) {
        router.replace("/login");
        return;
      }
      const m = await apiGet<any>("/me/", tk);
      const k = await apiGet<any>("/analytics/overview", tk);
      setMe(m);
      setKpis(k);
    } catch (err: any) {
      if (String(err?.message || "").includes("401")) {
        clearToken();
        clearRefreshToken();
        router.replace("/login");
        return;
      }
      const msg = String(err?.message || "");
      if (msg.includes("500")) {
        setError(
          t("Dashboard.serverError", {
            defaultValue: "El servidor no pudo cargar las métricas. Intenta más tarde.",
          }),
        );
      } else {
        setError(msg || t("Dashboard.loadError", { defaultValue: "Error al cargar el dashboard." }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const name = me ? `${me.first_name} ${me.last_name}` : "";

  const complaintsData = kpis?.complaints_by_group?.map((d: any) => ({
    group: d.group,
    total: d.total,
  })) ?? [];
  const fundraisingData = kpis?.fundraising_by_group?.map((d: any) => ({
    group: d.group__id,
    total: parseFloat(d.total),
  })) ?? [];
  const surveysData = kpis?.surveys_participation?.map((d: any) => ({
    group: d.survey__group,
    total: d.votes,
  })) ?? [];

  const stats = [
    { label: t("Dashboard.eventsUpcoming"), value: kpis?.events_upcoming ?? "—" },
    { label: t("Dashboard.eventsTotal", { defaultValue: "Eventos totales" }), value: kpis?.events_total ?? "—" },
    { label: t("Dashboard.eventsCancelled", { defaultValue: "Eventos cancelados" }), value: kpis?.events_cancelled ?? "—" },
    { label: t("Dashboard.complaintsOpen"), value: kpis?.complaints_open ?? "—" },
    { label: t("Dashboard.complaintsTotal"), value: kpis?.complaints_total ?? "—" },
    { label: t("Dashboard.suggestionsTotal", { defaultValue: "Sugerencias" }), value: kpis?.suggestions_total ?? "—" },
    { label: t("Dashboard.fundraisingTotal"), value: kpis?.fundraising_total ?? "—" },
  ];

  return (
    <>
      <Nav />
      <main className="container">
        <div className="page-title">
          <span className="pill">{t("Dashboard.pill", { defaultValue: "Resumen" })}</span>
          <h2>{t("Dashboard.welcome", { name })}</h2>
          <p className="subtle">
            {t("Dashboard.subtitle", { defaultValue: "Visión general del estado operativo." })}
          </p>
          <div className="actions">
            <button onClick={load} disabled={loading}>
              {loading ? t("Dashboard.loading", { defaultValue: "Cargando..." }) : t("Dashboard.refresh")}
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="label">{s.label}</span>
              <span className="value">{s.value}</span>
            </div>
          ))}
        </div>

        {kpis && (
          <div className="grid">
            <Card>
              <h3>{t("Dashboard.complaintsByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2f6f9f" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3>{t("Dashboard.fundraisingByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundraisingData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#d39a2f" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3>{t("Dashboard.surveysParticipation")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={surveysData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4c7f5d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </main>
      <style jsx>{`
        .grid {
          display: grid;
          gap: 1.75rem;
          margin-top: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .actions {
          margin-top: 0.5rem;
        }
        .stats {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .stat {
          border: 1px solid rgba(31, 42, 55, 0.12);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
        }
        .label {
          font-size: 0.85rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .value {
          display: block;
          font-size: 1.6rem;
          font-weight: 700;
          margin-top: 0.4rem;
        }
        .error {
          color: #7a1e16;
          background: rgba(186, 59, 46, 0.08);
          border: 1px solid rgba(186, 59, 46, 0.35);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
