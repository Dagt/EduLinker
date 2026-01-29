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
      <main style={{ padding: 16 }}>
        <h2>{t("GroupDetail.header")}</h2>
        {group && (
          <section aria-labelledby="group-info" style={{ marginBottom: 16 }}>
            <h3 id="group-info">{t("GroupDetail.infoTitle")}</h3>
            <p>{t("GroupDetail.groupName", { name: group.name })}</p>
            <p>{t("GroupDetail.groupGrade", { grade: group.grade_level })}</p>
            <p>
              {t("GroupDetail.homeroomLabel")} {group.homeroom_teacher || t("GroupDetail.none")}
            </p>
          </section>
        )}
        <div role="tablist" aria-label={t("GroupDetail.tabs")}
          style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={() => setTab("members")} aria-selected={tab === "members"}>
            {t("GroupDetail.membersTab")}
          </button>
          <button type="button" onClick={() => setTab("vocals")} aria-selected={tab === "vocals"}>
            {t("GroupDetail.vocalsTab")}
          </button>
          <button type="button" onClick={() => setTab("assignments")} aria-selected={tab === "assignments"}>
            {t("GroupDetail.assignmentsTab")}
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        {tab === "members" && members && (
          <section aria-labelledby="members-section">
            <h3 id="members-section">{t("GroupDetail.membersTitle")}</h3>
            <h4>{t("GroupDetail.students")}</h4>
            <ul>
              {members.students.map((student) => (
                <li key={student.id}>{student.first_name} {student.last_name}</li>
              ))}
            </ul>
            <h4>{t("GroupDetail.parents")}</h4>
            <ul>
              {members.parents.map((parent) => (
                <li key={parent.id}>{parent.first_name} {parent.last_name}</li>
              ))}
            </ul>
            <h4>{t("GroupDetail.teachers")}</h4>
            <ul>
              {members.teachers?.homeroom && (
                <li>{t("GroupDetail.homeroomTeacher", { name: `${members.teachers.homeroom.first_name} ${members.teachers.homeroom.last_name}` })}</li>
              )}
              {members.teachers?.specialists.map((teacher) => (
                <li key={teacher.id}>{t("GroupDetail.specialistTeacher", { name: `${teacher.first_name} ${teacher.last_name}` })}</li>
              ))}
            </ul>
          </section>
        )}

        {tab === "vocals" && (
          <section aria-labelledby="vocals-section">
            <h3 id="vocals-section">{t("GroupDetail.vocalsTitle")}</h3>
            <table aria-label={t("GroupDetail.vocalsTableAria")} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>{t("GroupDetail.parent")}</th>
                  <th style={{ textAlign: "left", padding: 8 }}>{t("GroupDetail.status")}</th>
                  <th style={{ padding: 8 }}>{t("GroupDetail.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {vocals.map((vocal) => {
                  const parent = parentMap.get(vocal.parent);
                  return (
                    <tr key={vocal.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 8 }}>{parent ? `${parent.first_name} ${parent.last_name}` : vocal.parent}</td>
                      <td style={{ padding: 8 }}>{vocal.active ? t("GroupDetail.active") : t("GroupDetail.inactive")}</td>
                      <td style={{ padding: 8 }}>
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
          <section aria-labelledby="assignments-section" style={{ display: "grid", gap: 16 }}>
            <h3 id="assignments-section">{t("GroupDetail.assignmentsTitle")}</h3>
            <form onSubmit={handleAssignHomeroom} aria-label={t("GroupDetail.assignHomeroom")}
              style={{ display: "grid", gap: 8, maxWidth: 480 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>{t("GroupDetail.selectHomeroom")}</span>
                <select value={homeroomId} onChange={(e) => setHomeroomId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">{t("GroupDetail.assignHomeroomButton")}</button>
            </form>

            <form onSubmit={handleAssignSpecialist} aria-label={t("GroupDetail.assignSpecialist")}
              style={{ display: "grid", gap: 8, maxWidth: 480 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>{t("GroupDetail.selectSpecialist")}</span>
                <select value={specialistId} onChange={(e) => setSpecialistId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span>{t("GroupDetail.subject")}</span>
                <input
                  value={specialistSubject}
                  onChange={(e) => setSpecialistSubject(e.target.value)}
                  required
                />
              </label>
              <button type="submit">{t("GroupDetail.assignSpecialistButton")}</button>
            </form>

            <form onSubmit={handleAssignVocal} aria-label={t("GroupDetail.assignVocal")}
              style={{ display: "grid", gap: 8, maxWidth: 480 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>{t("GroupDetail.selectVocal")}</span>
                <select value={vocalParentId} onChange={(e) => setVocalParentId(e.target.value)} required>
                  <option value="">{t("GroupDetail.selectPlaceholder")}</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">{t("GroupDetail.assignVocalButton")}</button>
            </form>
          </section>
        )}
      </main>
    </RequireRole>
  );
}
