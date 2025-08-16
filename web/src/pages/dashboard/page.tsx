"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
import KPICards from "@/app/analytics/KPICards";

const ComplaintsChart = dynamic(() => import("@/app/analytics/ComplaintsChart"), { ssr: false });
const FundraisingChart = dynamic(() => import("@/app/analytics/FundraisingChart"), { ssr: false });
const EventsChart = dynamic(() => import("@/app/analytics/EventsChart"), { ssr: false });
const SurveysChart = dynamic(() => import("@/app/analytics/SurveysChart"), { ssr: false });

export default function DashboardPage() {
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
  const kpis = !ready
    ? []
    : [
        {
          label: t("complaintsByGroup"),
          value: complaints.complaints_by_group.reduce(
            (sum: number, c: any) => sum + c.total,
            0
          ),
        },
        {
          label: t("fundraisingByGroup"),
          value: fundraising.fundraising_by_group.reduce(
            (sum: number, f: any) => sum + f.total,
            0
          ),
        },
        {
          label: t("eventsByScope"),
          value: overview.events_by_scope.reduce(
            (sum: number, e: any) => sum + e.total,
            0
          ),
        },
        {
          label: t("surveysParticipation"),
          value: engagement.surveys_participation.reduce(
            (sum: number, s: any) => sum + s.total,
            0
          ),
        },
      ];

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        {ready && (
          <>
            <KPICards items={kpis} />
            <div style={{ display: "grid", gap: 32 }}>
              <ComplaintsChart
                data={complaints.complaints_by_group}
                title={t("complaintsByGroup")}
              />
              <FundraisingChart
                data={fundraising.fundraising_by_group}
                title={t("fundraisingByGroup")}
              />
              <EventsChart
                data={overview.events_by_scope}
                title={t("eventsByScope")}
                colors={eventColors}
              />
              <SurveysChart
                data={engagement.surveys_participation}
                title={t("surveysParticipation")}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

