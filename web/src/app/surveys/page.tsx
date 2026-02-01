"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type Survey = {
  id: number;
  title: string;
  scope: string;
  group?: number | null;
  status: string;
  start_at?: string;
  end_at?: string;
  votes_count?: number;
};

function extractResults(payload: any): Survey[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results as Survey[];
  return [];
}

export default function SurveysPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Survey[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const res = await apiGet<any>("/surveys/", tk);
        setItems(extractResults(res));
      } catch (err: any) {
        setError(err?.message || t("Surveys.error", { defaultValue: "Error al cargar encuestas." }));
      }
    })();
  }, [t]);

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Surveys.pill", { defaultValue: "Participación" })}</span>
            <h2>{t("Surveys.title", { defaultValue: "Encuestas" })}</h2>
            <p className="subtle">
              {t("Surveys.subtitle", { defaultValue: "Crea, comparte y vota encuestas activas." })}
            </p>
          </div>
          <div className="actions">
            <Link className="button" href="/surveys/create">
              {t("Surveys.create", { defaultValue: "Nueva encuesta" })}
            </Link>
            <Link className="button secondary" href="/surveys/vote">
              {t("Surveys.vote", { defaultValue: "Votar" })}
            </Link>
          </div>
        </header>

        {error && <p className="alert error">{error}</p>}

        <section className="grid cards">
          {items.length === 0 && !error && (
            <div className="card empty">
              <h3>{t("Surveys.emptyTitle", { defaultValue: "Sin encuestas" })}</h3>
              <p className="subtle">
                {t("Surveys.emptyBody", { defaultValue: "Crea una para iniciar la participación." })}
              </p>
            </div>
          )}
          {items.map((s) => (
            <article key={s.id} className="card">
              <div className="card-header">
                <span className="chip">{s.status}</span>
                <span className="meta">#{s.id}</span>
              </div>
              <p className="card-title">{s.title}</p>
              <p className="subtle">
                {s.scope === "GROUP"
                  ? `${t("Surveys.group", { defaultValue: "Grupo" })} ${s.group ?? "—"}`
                  : t("Surveys.school", { defaultValue: "Toda la escuela" })}
              </p>
              <div className="card-footer">
                <span className="meta">
                  {t("Surveys.votes", { defaultValue: "Votos" })}: {s.votes_count ?? 0}
                </span>
                <Link className="link" href={`/surveys/vote?surveyId=${s.id}`}>
                  {t("Surveys.voteNow", { defaultValue: "Votar ahora" })}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
