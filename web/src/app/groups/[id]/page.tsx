"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { getToken } from "@/lib/auth";
import {
  assignHomeroom,
  assignSpecialist,
  assignVocal,
  deactivateVocal,
  getGroup,
  listGroupMembers,
  listGroupVocals,
  listUsers,
} from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

type Group = {
  id: number;
  name: string;
  grade_level: number;
  homeroom_teacher?: number | null;
};

type User = { id: number; first_name: string; last_name: string; email: string };

type Student = { id: number; first_name: string; last_name: string; enrollment_code: string };

type VocalAssignment = { id: number; parent: number; active: boolean; start_at: string; end_at: string | null };

type MemberPayload = {
  students: Student[];
  parents: User[];
  teachers?: { homeroom: User | null; specialists: User[] };
};

export default function GroupDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const groupId = Number(params?.id);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberPayload | null>(null);
  const [vocals, setVocals] = useState<VocalAssignment[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [tab, setTab] = useState<"members" | "vocals" | "assignments">("members");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const tk = getToken();
      const [groupRes, membersRes, vocalsRes, teachersRes, parentsRes] = await Promise.all([
        getGroup(groupId, tk),
        listGroupMembers(groupId, tk),
        listGroupVocals(groupId, tk),
        listUsers({ role: "MAESTRO_TITULAR" }, tk),
        listUsers({ role: "PADRE" }, tk),
      ]);
      setGroup(groupRes);
      setMembers(membersRes);
      setVocals(Array.isArray(vocalsRes?.results) ? vocalsRes.results : vocalsRes);
      const specialistRes = await listUsers({ role: "MAESTRO_ITINERANTE" }, tk);
      const teachersList = (Array.isArray(teachersRes?.results) ? teachersRes.results : teachersRes).concat(
        Array.isArray(specialistRes?.results) ? specialistRes.results : specialistRes,
      );
      setTeachers(teachersList);
      setParents(Array.isArray(parentsRes?.results) ? parentsRes.results : parentsRes);
    } catch (err: any) {
      setError(err.message || t("GroupDetail.error"));
    }
  };

  useEffect(() => {
    if (groupId) {
      load();
    }
  }, [groupId]);

  const teacherMap = useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers]);
  const parentMap = useMemo(() => new Map(parents.map((p) => [p.id, p])), [parents]);

  const [homeroomId, setHomeroomId] = useState("");
  const [specialistId, setSpecialistId] = useState("");
  const [specialistSubject, setSpecialistSubject] = useState("");
  const [vocalParentId, setVocalParentId] = useState("");

  const handleAssignHomeroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const tk = getToken();
      await assignHomeroom(groupId, Number(homeroomId), tk);
      setMessage(t("GroupDetail.assignedHomeroom"));
      setHomeroomId("");
      await load();
    } catch (err: any) {
      setError(err.message || t("GroupDetail.error"));
    }
  };

  const handleAssignSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const tk = getToken();
      await assignSpecialist(groupId, { teacher: Number(specialistId), subject: specialistSubject }, tk);
      setMessage(t("GroupDetail.assignedSpecialist"));
      setSpecialistId("");
      setSpecialistSubject("");
      await load();
    } catch (err: any) {
      setError(err.message || t("GroupDetail.error"));
    }
  };

  const handleAssignVocal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const tk = getToken();
      await assignVocal(groupId, Number(vocalParentId), tk);
      setMessage(t("GroupDetail.assignedVocal"));
      setVocalParentId("");
      await load();
    } catch (err: any) {
      setError(err.message || t("GroupDetail.error"));
    }
  };

  const handleDeactivateVocal = async (id: number) => {
    setError("");
    setMessage("");
    try {
      const tk = getToken();
      await deactivateVocal(id, tk);
      setMessage(t("GroupDetail.deactivatedVocal"));
      await load();
    } catch (err: any) {
      setError(err.message || t("GroupDetail.error"));
    }
  };

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("GroupDetail.pill", { defaultValue: "Grupos" })}</span>
            <h2>{t("GroupDetail.header")}</h2>
            <p className="subtle">
              {t("GroupDetail.subtitle", { defaultValue: "Gestiona miembros y asignaciones del grupo." })}
            </p>
          </div>
        </header>
        {group && (
          <section aria-labelledby="group-info" className="card stack">
            <h3 id="group-info">{t("GroupDetail.infoTitle")}</h3>
            <p className="card-title">{t("GroupDetail.groupName", { name: group.name })}</p>
            <p className="meta">{t("GroupDetail.groupGrade", { grade: group.grade_level })}</p>
            <p className="meta">
              {t("GroupDetail.homeroomLabel")} {group.homeroom_teacher || t("GroupDetail.none")}
            </p>
          </section>
        )}
        <div role="tablist" aria-label={t("GroupDetail.tabs")} className="toolbar">
          <button
            type="button"
            className={tab === "members" ? "button" : "button secondary"}
            onClick={() => setTab("members")}
            aria-selected={tab === "members"}
          >
            {t("GroupDetail.membersTab")}
          </button>
          <button
            type="button"
            className={tab === "vocals" ? "button" : "button secondary"}
            onClick={() => setTab("vocals")}
            aria-selected={tab === "vocals"}
          >
            {t("GroupDetail.vocalsTab")}
          </button>
          <button
            type="button"
            className={tab === "assignments" ? "button" : "button secondary"}
            onClick={() => setTab("assignments")}
            aria-selected={tab === "assignments"}
          >
            {t("GroupDetail.assignmentsTab")}
          </button>
        </div>
        {error && <p role="alert" className="alert error">{error}</p>}
        {message && <p role="status" className="alert success">{message}</p>}

        {tab === "members" && members && (
          <section aria-labelledby="members-section" className="grid-3">
            <article className="card">
              <h3 id="members-section">{t("GroupDetail.membersTitle")}</h3>
              <h4>{t("GroupDetail.students")}</h4>
              <ul className="stack">
                {members.students.map((student) => (
                  <li key={student.id}>{student.first_name} {student.last_name}</li>
                ))}
              </ul>
            </article>
            <article className="card">
              <h4>{t("GroupDetail.parents")}</h4>
              <ul className="stack">
                {members.parents.map((parent) => (
                  <li key={parent.id}>{parent.first_name} {parent.last_name}</li>
                ))}
              </ul>
            </article>
            <article className="card">
              <h4>{t("GroupDetail.teachers")}</h4>
              <ul className="stack">
                {members.teachers?.homeroom && (
                  <li>{t("GroupDetail.homeroomTeacher", { name: `${members.teachers.homeroom.first_name} ${members.teachers.homeroom.last_name}` })}</li>
                )}
                {members.teachers?.specialists.map((teacher) => (
                  <li key={teacher.id}>{t("GroupDetail.specialistTeacher", { name: `${teacher.first_name} ${teacher.last_name}` })}</li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {tab === "vocals" && (
          <section aria-labelledby="vocals-section" className="section">
            <h3 id="vocals-section">{t("GroupDetail.vocalsTitle")}</h3>
            <table aria-label={t("GroupDetail.vocalsTableAria")}>
              <thead>
                <tr>
                  <th>{t("GroupDetail.parent")}</th>
                  <th>{t("GroupDetail.status")}</th>
                  <th>{t("GroupDetail.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {vocals.map((vocal) => {
                  const parent = parentMap.get(vocal.parent);
                  return (
                    <tr key={vocal.id}>
                      <td>{parent ? `${parent.first_name} ${parent.last_name}` : vocal.parent}</td>
                      <td>{vocal.active ? t("GroupDetail.active") : t("GroupDetail.inactive")}</td>
                      <td>
                        {vocal.active && (
                          <button type="button" onClick={() => handleDeactivateVocal(vocal.id)}>
                            {t("GroupDetail.deactivate")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {tab === "assignments" && (
          <section aria-labelledby="assignments-section" className="section">
            <h3 id="assignments-section">{t("GroupDetail.assignmentsTitle")}</h3>
            <div className="grid-2">
              <form className="card form" onSubmit={handleAssignHomeroom} aria-label={t("GroupDetail.assignHomeroom")}>
              <label>
                {t("GroupDetail.selectHomeroom")}
                <select value={homeroomId} onChange={(e) => setHomeroomId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("GroupDetail.assignHomeroomButton")}</button>
              </div>
              </form>

              <form className="card form" onSubmit={handleAssignSpecialist} aria-label={t("GroupDetail.assignSpecialist")}>
              <label>
                {t("GroupDetail.selectSpecialist")}
                <select value={specialistId} onChange={(e) => setSpecialistId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("GroupDetail.subject")}
                <input
                  value={specialistSubject}
                  onChange={(e) => setSpecialistSubject(e.target.value)}
                  required
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("GroupDetail.assignSpecialistButton")}</button>
              </div>
              </form>

              <form className="card form" onSubmit={handleAssignVocal} aria-label={t("GroupDetail.assignVocal")}>
              <label>
                {t("GroupDetail.selectVocal")}
                <select value={vocalParentId} onChange={(e) => setVocalParentId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("GroupDetail.assignVocalButton")}</button>
              </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </RequireRole>
  );
}
