"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { listFeed } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type FeedItem = {
  id: number;
  type: "announcement" | "homework";
  title?: string;
  message?: string;
  description?: string;
  subject?: string;
  group?: number;
  created_at: string;
  due_date?: string;
  scope?: string;
};

export default function FeedPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await listFeed(tk);
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || t("Feed.error", { defaultValue: "Error al cargar el feed." }));
      }
    })();
  }, [t]);

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Feed.pill", { defaultValue: "Novedades" })}</span>
            <h2>{t("Feed.header", { defaultValue: "Feed" })}</h2>
            <p className="subtle">
              {t("Feed.subtitle", { defaultValue: "Avisos y tareas recientes de tus grupos." })}
            </p>
          </div>
        </header>
        {error && <p className="alert error">{error}</p>}
        <section className="grid cards">
          {items.map((item) => (
            <article key={`${item.type}-${item.id}`} className="card">
              <div className="card-header">
                <span className="chip">
                  {item.type === "announcement"
                    ? t("Feed.announcement", { defaultValue: "Aviso" })
                    : t("Feed.homework", { defaultValue: "Tarea" })}
                </span>
                <span className="meta">#{item.id}</span>
              </div>
              <p className="card-title">{item.title || item.subject || "--"}</p>
              <p className="subtle">{item.message || item.description || "--"}</p>
              <div className="card-footer">
                <span className="meta">
                  {t("Feed.group", { defaultValue: "Grupo" })} {item.group ?? "--"}
                </span>
                <span className="meta">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
