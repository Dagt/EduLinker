"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import {
  getAnalytics,
  getComplaintsAnalytics,
  getFundraisingAnalytics,
  getEngagementAnalytics,
} from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [complaints, setComplaints] = useState<any>(null);
  const [fundraising, setFundraising] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const [ov, comp, fund, eng] = await Promise.all([
          getAnalytics(tk),
          getComplaintsAnalytics(tk),
          getFundraisingAnalytics(tk),
          getEngagementAnalytics(undefined, tk),
        ]);
        setOverview(ov);
        setComplaints(comp);
        setFundraising(fund);
        setEngagement(eng);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if (!requireRole(["admin"])) return <p>{t("AnalyticsDashboard.unauthorized")}</p>;

  const commonBarOptions = { responsive: true, maintainAspectRatio: false } as const;

  const complaintsChart = {
    labels: complaints?.complaints_by_group?.map((d: any) => d.group) ?? [],
    datasets: [
      {
        label: t("AnalyticsDashboard.complaintsByGroup"),
        data: complaints?.complaints_by_group?.map((d: any) => d.total) ?? [],
        backgroundColor: "#8884d8",
      },
    ],
  };

  const fundraisingChart = {
    labels: fundraising?.fundraising_by_group?.map((d: any) => d.group__id) ?? [],
    datasets: [
      {
        label: t("AnalyticsDashboard.fundraisingByGroup"),
        data:
          fundraising?.fundraising_by_group?.map((d: any) => parseFloat(d.total)) ?? [],
        backgroundColor: "#82ca9d",
      },
    ],
  };

  const eventsChart = {
    labels: overview?.events_by_scope?.map((d: any) => d.scope) ?? [],
    datasets: [
      {
        data: overview?.events_by_scope?.map((d: any) => d.total) ?? [],
        backgroundColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
      },
    ],
  };

  const surveysChart = {
    labels: engagement?.surveys_participation?.map((d: any) => d.group_id) ?? [],
    datasets: [
      {
        label: t("AnalyticsDashboard.surveysParticipation"),
        data: engagement?.surveys_participation?.map((d: any) => d.total) ?? [],
        backgroundColor: "#ffc658",
      },
    ],
  };

  const ready = overview && complaints && fundraising && engagement;

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("AnalyticsDashboard.pill", { defaultValue: "Analitica" })}</span>
            <h2>{t("AnalyticsDashboard.header")}</h2>
            <p className="subtle">
              {t("AnalyticsDashboard.subtitle", { defaultValue: "Resumen operativo para el equipo administrativo." })}
            </p>
          </div>
        </header>
        {ready && (
          <div className="grid-2">
            <section className="card">
              <h3>{t("AnalyticsDashboard.complaintsByGroup")}</h3>
              <div className="chart">
                <Bar data={complaintsChart} options={commonBarOptions} />
              </div>
            </section>
            <section className="card">
              <h3>{t("AnalyticsDashboard.fundraisingByGroup")}</h3>
              <div className="chart">
                <Bar data={fundraisingChart} options={commonBarOptions} />
              </div>
            </section>
            <section className="card">
              <h3>{t("AnalyticsDashboard.eventsByScope")}</h3>
              <div className="chart">
                <Pie
                  data={eventsChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </section>
            <section className="card">
              <h3>{t("AnalyticsDashboard.surveysParticipation")}</h3>
              <div className="chart">
                <Bar data={surveysChart} options={commonBarOptions} />
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

