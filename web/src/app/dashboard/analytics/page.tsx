"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { getAnalytics } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AnalyticsDashboard(){
  const [stats,setStats]=useState<any>(null);
  const t = useTranslations("AnalyticsDashboard");
  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const r = await getAnalytics(tk);
        setStats(r);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if(!requireRole(["admin"])) return <p>{t("unauthorized")}</p>;

  const complaintsData =
    stats?.complaints_by_group?.map((d: any) => ({ group: d.group, total: d.total })) ?? [];
  const fundraisingData =
    stats?.fundraising_by_group?.map((d: any) => ({ group: d.group__id, total: parseFloat(d.total) })) ?? [];
  const eventsData =
    stats?.events_by_scope?.map((d: any) => ({ name: d.scope, value: d.total })) ?? [];
  const surveysData =
    stats?.surveys_participation?.map((d: any) => ({ group: d.survey__group, total: d.votes })) ?? [];
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        {stats && (
          <div style={{ display: "grid", gap: 32 }}>
            <section>
              <h3>{t("complaintsByGroup")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complaintsData}>
                  <CartesianGrid strokeDasharray="3 3" />
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </section>
            <section>
              <h3>{t("eventsByScope")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={eventsData} dataKey="value" nameKey="name" label>
                    {eventsData.map((_: any, idx: number) => (
                      <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </section>
            <section>
              <h3>{t("surveysParticipation")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={surveysData}>
                  <CartesianGrid strokeDasharray="3 3" />
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
