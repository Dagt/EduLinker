"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiGet, voteSurvey } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import "@/i18n";

type Survey = {
  id: number;
  title: string;
  description?: string;
  options: string[];
  status: string;
};

export default function SurveyVote() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [surveyId, setSurveyId] = useState(searchParams.get("surveyId") || "");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSurveyId(searchParams.get("surveyId") || "");
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      if (!surveyId) return;
      setError("");
      try {
        const tk = getToken();
        const data = await apiGet<Survey>(`/surveys/${surveyId}/`, tk);
        setSurvey(data);
      } catch (err: any) {
        setError(err?.message || t("SurveyVote.error"));
      }
    })();
  }, [surveyId, t]);

  if (!requireRole(["admin", "director", "teacher", "parent", "vocal"])) {
    return <p>{t("SurveyVote.unauthorized")}</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!surveyId || choice === null) {
      setError(t("SurveyVote.missing", { defaultValue: "Selecciona una opción." }));
      return;
    }
    try {
      const tk = getToken();
      await voteSurvey(Number(surveyId), Number(choice), tk);
      setMsg(t("SurveyVote.voted"));
    } catch (err: any) {
      setError(err.message || t("SurveyVote.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("SurveyVote.pill", { defaultValue: "Votación" })}</span>
            <h2>{t("SurveyVote.header")}</h2>
            <p className="subtle">
              {t("SurveyVote.subtitle", { defaultValue: "Selecciona una opción y registra tu voto." })}
            </p>
          </div>
        </header>

        <form className="card form" onSubmit={submit}>
          <label>
            {t("SurveyVote.surveyId")}
            <input
              placeholder={t("SurveyVote.surveyId")}
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
            />
          </label>

          {survey && (
            <div className="options">
              <p className="card-title">{survey.title}</p>
              {survey.description && <p className="subtle">{survey.description}</p>}
              {survey.options.map((opt, idx) => (
                <label key={opt} className="option">
                  <input
                    type="radio"
                    name="option"
                    checked={choice === idx}
                    onChange={() => setChoice(idx)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button className="button primary" type="submit">
              {t("SurveyVote.vote")}
            </button>
          </div>

          {msg && <p className="alert success">{msg}</p>}
          {error && <p className="alert error">{error}</p>}
        </form>
      </main>
    </>
  );
}
