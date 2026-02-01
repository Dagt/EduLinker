"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { createHomework, listHomeworks } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

type Homework = {
  id: number;
  group: number;
  subject: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
};

function extractResults(payload: any): Homework[] {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results as Homework[];
  return [];
}

export default function HomeworksPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Homework[]>([]);
  const [error, setError] = useState("");
  const [groupId, setGroupId] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const isDirector = requireRole(["admin", "director"]);
  const canCreate = requireRole(["teacher"]);

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await listHomeworks(tk);
        setItems(extractResults(data));
      } catch (err: any) {
        setError(err?.message || t("Homeworks.error", { defaultValue: "Error al cargar tareas." }));
      }
    })();
  }, [t]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await createHomework({
        group: Number(groupId),
        subject,
        title,
        description,
        due_date: dueDate,
      });
      setItems([created, ...items]);
      setGroupId("");
      setSubject("");
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err: any) {
      setError(err?.message || t("Homeworks.error", { defaultValue: "Error al crear tarea." }));
    }
  }

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Homeworks.pill", { defaultValue: "Tareas" })}</span>
            <h2>{t("Homeworks.header", { defaultValue: "Tareas" })}</h2>
            <p className="subtle">
              {t("Homeworks.subtitle", { defaultValue: "Publica tareas y fechas límite por grupo." })}
            </p>
          </div>
        </header>

        {isDirector && (
          <p className="alert">
            {t("Homeworks.directorNotice", { defaultValue: "Las tareas son visibles solo para docentes y familias." })}
          </p>
        )}

        {canCreate && (
          <section className="card form">
            <h3>{t("Homeworks.create", { defaultValue: "Crear tarea" })}</h3>
            <form className="form" onSubmit={submit}>
              <input
                placeholder={t("Homeworks.groupId", { defaultValue: "ID de grupo" })}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
              />
              <input
                placeholder={t("Homeworks.subject", { defaultValue: "Materia" })}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <input
                placeholder={t("Homeworks.title", { defaultValue: "Título" })}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder={t("Homeworks.description", { defaultValue: "Descripción" })}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <button className="button" type="submit">
                {t("Homeworks.publish", { defaultValue: "Publicar" })}
              </button>
            </form>
          </section>
        )}

        {error && <p className="alert error">{error}</p>}

        <section className="grid cards">
          {items.map((item) => (
            <article key={item.id} className="card">
              <div className="card-header">
                <span className="chip">{item.subject}</span>
                <span className="meta">#{item.id}</span>
              </div>
              <p className="card-title">{item.title}</p>
              <p className="subtle">{item.description}</p>
              <div className="card-footer">
                <span className="meta">
                  {t("Homeworks.group", { defaultValue: "Grupo" })} {item.group}
                </span>
                <span className="meta">
                  {t("Homeworks.due", { defaultValue: "Entrega" })}: {item.due_date}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
