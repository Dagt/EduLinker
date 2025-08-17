"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { getFundraisingEventSummary, exportFundraisingEvent } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function FundraisingSummary() {
  const { t } = useTranslation();
  const [eventId, setEventId] = useState("");
  const [summary, setSummary] = useState<any | null>(null);
  const [msg, setMsg] = useState("");

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if(!eventId.trim()){
      setSummary(null);
      setMsg(t('Validation.required'));
      return;
    }
    if(isNaN(Number(eventId))){
      setSummary(null);
      setMsg(t('Validation.invalidNumber'));
      return;
    }
    try {
      const tk = getToken();
      const data = await getFundraisingEventSummary(Number(eventId), tk);
      setSummary(data);
    } catch (err) {
      console.error(err);
      setSummary(null);
    }
  }

  async function download(format: "csv" | "pdf") {
    try {
      const tk = getToken();
      const blob = await exportFundraisingEvent(Number(eventId), format, tk);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fundraising_${eventId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  if (!requireRole(["admin", "treasurer"])) return <p>{t("FundraisingSummary.unauthorized")}</p>;

  const totalExpenses =
    summary?.expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0;
  const balance = summary ? Number(summary.total_collected) - totalExpenses : 0;

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("FundraisingSummary.header")}</h2>
        <form onSubmit={load}>
          <input
            placeholder={t("FundraisingSummary.eventId")}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
            required
          />
          <button>{t("FundraisingSummary.load")}</button>
        </form>
        {msg && <p>{msg}</p>}
        {summary && (
          <>
            <p>
              {t("FundraisingSummary.totalCollected")}: {summary.total_collected}
            </p>
            <p>
              {t("FundraisingSummary.totalExpenses")}: {totalExpenses.toFixed(2)}
            </p>
            <p>
              {t("FundraisingSummary.balance")}: {balance.toFixed(2)}
            </p>
            <table>
              <thead>
                <tr>
                  <th>{t("FundraisingSummary.concept")}</th>
                  <th>{t("FundraisingSummary.amount")}</th>
                  <th>{t("FundraisingSummary.file")}</th>
                </tr>
              </thead>
              <tbody>
                {summary.expenses?.map((exp: any) => (
                  <tr key={exp.id}>
                    <td>{exp.concept}</td>
                    <td>{exp.amount}</td>
                    <td>
                      <a
                        href={exp.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("FundraisingSummary.file")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => download("csv")} style={{ marginRight: 8 }}>
              {t("FundraisingSummary.downloadCsv")}
            </button>
            <button onClick={() => download("pdf")}> 
              {t("FundraisingSummary.downloadPdf")}
            </button>
          </>
        )}
      </main>
    </>
  );
}
