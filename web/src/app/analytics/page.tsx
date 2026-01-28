"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import {
  getAnalytics,
  getComplaintsAnalytics,
  getFundraisingAnalytics,
  getEngagementAnalytics,
  getEventAttendanceAnalytics,
  getMe,
} from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import KPICards from "./KPICards";
import ComplaintsChart from "./ComplaintsChart";
import FundraisingChart from "./FundraisingChart";
import EventsChart from "./EventsChart";
import SurveysChart from "./SurveysChart";
import AttendanceChart from "./AttendanceChart";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [complaints, setComplaints] = useState<any>(null);
  const [fundraising, setFundraising] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setRole(me.role);
        if (me.role === "DIRECTOR") {
          const [ov, comp, fund, eng, att] = await Promise.all([
            getAnalytics(),
            getComplaintsAnalytics(),
            getFundraisingAnalytics(),
            getEngagementAnalytics(),
            getEventAttendanceAnalytics({}),
          ]);
          setOverview(ov);
          setComplaints(comp);
          setFundraising(fund);
          setEngagement(eng);
          setAttendance(att);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if (role && role !== "DIRECTOR") {
    return (
      <>
        <Nav />
        <main style={{ padding: 16 }}>
          <h2>{t("Analytics.header")}</h2>
        </main>
      </>
    );
  }

  const ready = overview && complaints && fundraising && engagement && attendance;
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
        {
          label: t("Analytics.attendanceYes"),
          value: attendance.attending_yes,
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
              <AttendanceChart
                data={attendance.attendance_by_group}
                title={t("Analytics.attendanceByGroup")}
              />
              <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
                <h3>{t("Analytics.accessSettingsTitle")}</h3>
                <p>{t("Analytics.accessSettingsDescription")}</p>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
