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
import KPICards from "./KPICards";
import ComplaintsChart from "./ComplaintsChart";
import FundraisingChart from "./FundraisingChart";
import EventsChart from "./EventsChart";
import SurveysChart from "./SurveysChart";

export default function AnalyticsPage() {
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

  if (!requireRole(["admin"])) return <p>{t("Analytics.unauthorized")}</p>;

  const ready = overview && complaints && fundraising && engagement;
  const eventColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  const kpis = !ready
    ? []
    : [
        {
          label: t("Analytics.complaintsByGroup"),
          value: complaints.complaints_by_group.reduce(
            (sum: number, c: any) => sum + c.total,
            0
          ),
        },
        {
          label: t("Analytics.fundraisingByGroup"),
          value: fundraising.fundraising_by_group.reduce(
            (sum: number, f: any) => sum + f.total,
            0
          ),
        },
        {
          label: t("Analytics.eventsByScope"),
          value: overview.events_by_scope.reduce(
            (sum: number, e: any) => sum + e.total,
            0
          ),
        },
        {
          label: t("Analytics.surveysParticipation"),
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
        <h2>{t("Analytics.header")}</h2>
        {ready && (
          <>
            <KPICards items={kpis} />
            <div style={{ display: "grid", gap: 32 }}>
              <ComplaintsChart
                data={complaints.complaints_by_group}
                title={t("Analytics.complaintsByGroup")}
              />
              <FundraisingChart
                data={fundraising.fundraising_by_group}
                title={t("Analytics.fundraisingByGroup")}
              />
              <EventsChart
                data={overview.events_by_scope}
                title={t("Analytics.eventsByScope")}
                colors={eventColors}
              />
              <SurveysChart
                data={engagement.surveys_participation}
                title={t("Analytics.surveysParticipation")}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

