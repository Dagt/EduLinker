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
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("FundraisingSummary.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t("FundraisingSummary.header")}</h2>
            <p className="subtle">
              {t("FundraisingSummary.subtitle", { defaultValue: "Consulta el resumen financiero por evento." })}
            </p>
          </div>
        </header>
        <section className="card form">
          <form className="form-inline" onSubmit={load}>
            <input
              placeholder={t("FundraisingSummary.eventId")}
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />
            <button className="button" type="submit">{t("FundraisingSummary.load")}</button>
          </form>
        </section>
        {msg && <p className="alert error">{msg}</p>}
        {summary && (
          <>
            <section className="grid-3">
              <div className="card">
                <p className="meta">{t("FundraisingSummary.totalCollected")}</p>
                <p className="card-title">{summary.total_collected}</p>
              </div>
              <div className="card">
                <p className="meta">{t("FundraisingSummary.totalExpenses")}</p>
                <p className="card-title">{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="meta">{t("FundraisingSummary.balance")}</p>
                <p className="card-title">{balance.toFixed(2)}</p>
              </div>
            </section>
            <section className="section">
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
              <div className="actions">
                <button className="button secondary" onClick={() => download("csv")}>
                  {t("FundraisingSummary.downloadCsv")}
                </button>
                <button className="button" onClick={() => download("pdf")}>
                  {t("FundraisingSummary.downloadPdf")}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
