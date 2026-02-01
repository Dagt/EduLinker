"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

export default function ComplaintCreate() {
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      const body: any = {
        group: Number(groupId),
        target_teacher: Number(teacherId),
        description,
      };
      if (studentId) body.about_student = Number(studentId);
      const res = await apiPost<any>("/complaints/", body, tk);
      setMsg(t("ComplaintCreate.created", { id: res.id }));
      setGroupId("");
      setTeacherId("");
      setStudentId("");
      setDescription("");
    } catch (err: any) {
      setMsg(err.message || t("ComplaintCreate.error"));
    }
  }

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("ComplaintCreate.pill", { defaultValue: "Nuevo caso" })}</span>
            <h2>{t("ComplaintCreate.header")}</h2>
            <p className="subtle">
              {t("ComplaintCreate.subtitle", {
                defaultValue: "Registra una incidencia y asigna a un docente responsable.",
              })}
            </p>
          </div>
          <Link className="link" href="/complaints">
            {t("ComplaintCreate.back", { defaultValue: "Volver a la lista" })}
          </Link>
        </header>

        <form className="card form" onSubmit={submit}>
          <label>
            {t("ComplaintCreate.groupId")}
            <input
              placeholder={t("ComplaintCreate.groupId")}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            />
          </label>
          <label>
            {t("ComplaintCreate.teacherId")}
            <input
              placeholder={t("ComplaintCreate.teacherId")}
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
            />
          </label>
          <label>
            {t("ComplaintCreate.studentId")}
            <input
              placeholder={t("ComplaintCreate.studentId")}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </label>
          <label>
            {t("ComplaintCreate.description")}
            <textarea
              placeholder={t("ComplaintCreate.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="button primary">
              {t("ComplaintCreate.create")}
            </button>
          </div>
          {msg && <p className="alert">{msg}</p>}
        </form>
      </main>
    </>
  );
}
