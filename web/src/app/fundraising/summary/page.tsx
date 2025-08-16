"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { getFundraisingEventSummary } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslations } from "next-intl";

export default function FundraisingSummary() {
  const t = useTranslations("FundraisingSummary");
  const [eventId, setEventId] = useState("");
  const [summary, setSummary] = useState<any | null>(null);

  async function load(e: React.FormEvent) {
    e.preventDefault();
    try {
      const tk = getToken();
      const data = await getFundraisingEventSummary(Number(eventId), tk);
      setSummary(data);
    } catch (err) {
      console.error(err);
      setSummary(null);
    }
  }

  if (!requireRole(["admin", "treasurer"])) return <p>{t("unauthorized")}</p>;

  const totalExpenses =
    summary?.expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0;
  const balance = summary ? Number(summary.total_collected) - totalExpenses : 0;

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("header")}</h2>
        <form onSubmit={load}>
          <input
            placeholder={t("eventId")}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
            required
          />
          <button>{t("load")}</button>
        </form>
        {summary && (
          <>
            <p>
              {t("totalCollected")}: {summary.total_collected}
            </p>
            <p>
              {t("totalExpenses")}: {totalExpenses.toFixed(2)}
            </p>
            <p>
              {t("balance")}: {balance.toFixed(2)}
            </p>
            <table>
              <thead>
                <tr>
                  <th>{t("concept")}</th>
                  <th>{t("amount")}</th>
                  <th>{t("file")}</th>
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
                        {t("file")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </>
  );
}
