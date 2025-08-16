"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Dashboard");

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
      <main style={{ padding: 16 }}>
        <h2>{t("welcome", { name })}</h2>
        <button onClick={load}>{t("refresh")}</button>
        {kpis && (
          <div style={{ display: "grid", gap: 32 }}>
            <section>
              <h3>{t("complaintsByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </section>
            <section>
              <h3>{t("fundraisingByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundraisingData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </section>
            <section>
              <h3>{t("surveysParticipation")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={surveysData}>
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
