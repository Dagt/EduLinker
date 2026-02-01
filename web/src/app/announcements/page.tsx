"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { createAnnouncement, listAnnouncements } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

type Announcement = {
  id: number;
  scope: string;
  group?: number | null;
  title: string;
  message: string;
  created_at: string;
};

function extractResults(payload: any): Announcement[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results as Announcement[];
  return [];
}

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Announcement[]>([]);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<"GLOBAL" | "GRUPO">("GRUPO");
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const canCreate = requireRole(["admin", "director", "teacher"]);

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await listAnnouncements(tk);
        setItems(extractResults(data));
      } catch (err: any) {
        setError(err?.message || t("Announcements.error", { defaultValue: "Error al cargar avisos." }));
      }
    })();
  }, [t]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        scope,
        group: scope === "GRUPO" ? Number(groupId) : null,
        title,
        message,
      };
      const created = await createAnnouncement(payload);
      setItems([created, ...items]);
      setTitle("");
      setMessage("");
      setGroupId("");
      setScope("GRUPO");
    } catch (err: any) {
      setError(err?.message || t("Announcements.error", { defaultValue: "Error al crear aviso." }));
    }
  }

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Announcements.pill", { defaultValue: "Comunicados" })}</span>
            <h2>{t("Announcements.header", { defaultValue: "Avisos" })}</h2>
            <p className="subtle">
              {t("Announcements.subtitle", { defaultValue: "Publica comunicados por escuela o por grupo." })}
            </p>
          </div>
        </header>

        {canCreate && (
          <section className="card form">
            <h3>{t("Announcements.create", { defaultValue: "Crear aviso" })}</h3>
            <form className="form" onSubmit={submit}>
              <select value={scope} onChange={(e) => setScope(e.target.value as any)}>
                <option value="GRUPO">{t("Announcements.scopeGroup", { defaultValue: "Por grupo" })}</option>
                <option value="GLOBAL">{t("Announcements.scopeGlobal", { defaultValue: "Global" })}</option>
              </select>
              {scope === "GRUPO" && (
                <input
                  placeholder={t("Announcements.groupId", { defaultValue: "ID de grupo" })}
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                />
              )}
              <input
                placeholder={t("Announcements.title", { defaultValue: "Título" })}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder={t("Announcements.message", { defaultValue: "Mensaje" })}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button className="button" type="submit">
                {t("Announcements.publish", { defaultValue: "Publicar" })}
              </button>
            </form>
          </section>
        )}

        {error && <p className="alert error">{error}</p>}

        <section className="grid cards">
          {items.map((item) => (
            <article key={item.id} className="card">
              <div className="card-header">
                <span className="chip">{item.scope}</span>
                <span className="meta">#{item.id}</span>
              </div>
              <p className="card-title">{item.title}</p>
              <p className="subtle">{item.message}</p>
              <div className="card-footer">
                <span className="meta">
                  {item.group ? `${t("Announcements.group", { defaultValue: "Grupo" })} ${item.group}` : t("Announcements.global", { defaultValue: "Global" })}
                </span>
                <span className="meta">{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
