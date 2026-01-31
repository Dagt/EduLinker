"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Card from "@/components/Card";
import { getToken } from "@/lib/auth";
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

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const tk = getToken();
      const m = await apiGet<any>("/me/", tk);
      const k = await apiGet<any>("/analytics/overview", tk);
      setMe(m);
      setKpis(k);
    } catch (err: any) {
      setError(err?.message || "Error loading dashboard");
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
    { label: t("Dashboard.complaintsOpen"), value: kpis?.complaints_open ?? "—" },
    { label: t("Dashboard.complaintsTotal"), value: kpis?.complaints_total ?? "—" },
    { label: t("Dashboard.fundraisingTotal"), value: kpis?.fundraising_total ?? "—" },
  ];

  return (
    <>
      <Nav />
      <main className="container">
        <div className="page-title">
          <span className="pill">Overview</span>
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
                  <Bar dataKey="total" fill="#38bdf8" />
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
                  <Bar dataKey="total" fill="#f59e0b" />
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
                  <Bar dataKey="total" fill="#a78bfa" />
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
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.06);
        }
        .label {
          font-size: 0.85rem;
          color: #cbd5f5;
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
          color: #fecaca;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.4);
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
