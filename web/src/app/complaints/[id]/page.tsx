"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { addComplaintParticipant, apiGet, apiPost, updateComplaintStatus } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

const statuses = ["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED"];

export default function ComplaintThread({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [complaint, setComplaint] = useState<any>();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participantRole, setParticipantRole] = useState("PADRE");
  const { t } = useTranslation();

  async function load() {
    try {
      const tk = getToken();
      const data = await apiGet<any>(`/complaints/${id}/`, tk);
      setComplaint(data);
      setStatus(data.status || "OPEN");
    } catch (e: any) {
      setMsg(e.message || t("ComplaintThread.loadError"));
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      await apiPost(`/complaints/${id}/messages/`, { message: text, attachments: [] }, tk);
      setText("");
      await load();
    } catch (e: any) {
      setMsg(e.message || t("ComplaintThread.sendError"));
    }
  }

  async function saveStatus() {
    setMsg("");
    try {
      const tk = getToken();
      await updateComplaintStatus(id, status, tk);
      await load();
      setMsg(t("ComplaintThread.statusUpdated", { defaultValue: "Estado actualizado." }));
    } catch (e: any) {
      setMsg(e.message || t("ComplaintThread.statusError", { defaultValue: "No se pudo actualizar el estado." }));
    }
  }

  async function addParticipant() {
    setMsg("");
    try {
      const tk = getToken();
      await addComplaintParticipant(
        id,
        { user: Number(participantId), role_in_thread: participantRole },
        tk,
      );
      setParticipantId("");
      await load();
      setMsg(t("ComplaintThread.participantAdded", { defaultValue: "Participante agregado." }));
    } catch (e: any) {
      setMsg(e.message || t("ComplaintThread.participantError", { defaultValue: "No se pudo agregar participante." }));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("ComplaintThread.pill", { defaultValue: "Incidencia" })}</span>
            <h2>{t("ComplaintThread.header", { id })}</h2>
            <p className="subtle">{t("ComplaintThread.subtitle", { defaultValue: "Historial y seguimiento del caso." })}</p>
          </div>
          <Link className="link" href="/complaints">
            {t("ComplaintThread.back", { defaultValue: "Volver" })}
          </Link>
        </header>

        {complaint ? (
          <div className="grid">
            <section className="card">
              <div className="card-header">
                <span className="chip">{complaint.status}</span>
                <span className="meta">#{complaint.id}</span>
              </div>
              <p className="card-title">{complaint.description}</p>
              <div className="card-footer">
                <span className="meta">
                  {t("ComplaintThread.group", { defaultValue: "Grupo" })}: {complaint.group}
                </span>
                <span className="meta">
                  {t("ComplaintThread.teacher", { defaultValue: "Maestro" })}: {complaint.target_teacher}
                </span>
              </div>
            </section>

            <section className="card">
              <h3>{t("ComplaintThread.status")}</h3>
              <div className="form">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button className="button" onClick={saveStatus}>
                  {t("ComplaintThread.updateStatus", { defaultValue: "Actualizar estado" })}
                </button>
              </div>
            </section>

            <section className="card">
              <h3>{t("ComplaintThread.participants", { defaultValue: "Participantes" })}</h3>
              <ul>
                {complaint.participants?.map((p: any) => (
                  <li key={p.id} className="meta">
                    {p.user} — {p.role_in_thread}
                  </li>
                ))}
              </ul>
              <div className="form">
                <input
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder={t("ComplaintThread.participantId", { defaultValue: "ID de usuario" })}
                />
                <select value={participantRole} onChange={(e) => setParticipantRole(e.target.value)}>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="MAESTRO_TITULAR">MAESTRO_TITULAR</option>
                  <option value="MAESTRO_ITINERANTE">MAESTRO_ITINERANTE</option>
                  <option value="VOCAL">VOCAL</option>
                  <option value="PADRE">PADRE</option>
                </select>
                <button className="button secondary" onClick={addParticipant}>
                  {t("ComplaintThread.addParticipant", { defaultValue: "Agregar participante" })}
                </button>
              </div>
            </section>

            <section className="card">
              <h3>{t("ComplaintThread.messages")}</h3>
              <ul className="messages">
                {complaint.messages?.map((m: any) => (
                  <li key={m.id}>
                    <div className="meta">
                      {`${m.author?.first_name ?? ""} ${m.author?.last_name ?? ""}`.trim() || m.author?.email || "—"}
                      {" — "}
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                    <div>{m.message}</div>
                  </li>
                ))}
              </ul>
              <form className="form" onSubmit={send}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("ComplaintThread.reply")}
                />
                <button className="button" type="submit">
                  {t("ComplaintThread.send")}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <p>{t("ComplaintThread.loading")}</p>
        )}
        {msg && <p className="alert">{msg}</p>}
      </main>
    </>
  );
}
