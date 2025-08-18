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
  const { t } = useTranslation();

  const load = async () => {
    const tk = getToken();
    const m = await apiGet<any>("/me/", tk);
    const k = await apiGet<any>("/analytics/overview", tk);
    setMe(m);
    setKpis(k);
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

  return (
    <>
      <Nav />
      <main className="container">
        <h2>{t("Dashboard.welcome", { name })}</h2>
        <button onClick={load}>{t("Dashboard.refresh")}</button>
        {kpis && (
          <div className="grid">
            <Card>
              <h3>{t("Dashboard.complaintsByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
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
                  <Bar dataKey="total" fill="#82ca9d" />
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
                  <Bar dataKey="total" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </main>
      <style jsx>{`
        .container {
          padding: 1rem;
        }
        .grid {
          display: grid;
          gap: 2rem;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
