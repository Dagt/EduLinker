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
} from "recharts";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [complaints, setComplaints] = useState<any>(null);
  const [fundraising, setFundraising] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const t = useTranslations("Analytics");

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

  if (!requireRole(["admin"])) return <p>{t("unauthorized")}</p>;

  const ready = overview && complaints && fundraising && engagement;
  const eventColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        {ready && (
          <div style={{ display: "grid", gap: 32 }}>
            <section>
              <h3>{t("complaintsByGroup")}</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={complaints.complaints_by_group}>
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section>
              <h3>{t("fundraisingByGroup")}</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={fundraising.fundraising_by_group}>
                    <XAxis dataKey="group__id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section>
              <h3>{t("eventsByScope")}</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={overview.events_by_scope}
                      dataKey="total"
                      nameKey="scope"
                      label
                    >
                      {overview.events_by_scope.map((_: any, i: number) => (
                        <Cell key={i} fill={eventColors[i % eventColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section>
              <h3>{t("surveysParticipation")}</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={engagement.surveys_participation}>
                    <XAxis dataKey="group_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

