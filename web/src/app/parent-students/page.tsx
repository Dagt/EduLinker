"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { getToken } from "@/lib/auth";
import { listParentStudents, listStudents, listUsers, deleteParentStudent } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

type ParentStudent = {
  id: number;
  parent: number;
  student: number;
  relationship: string;
};

type User = { id: number; first_name: string; last_name: string; email: string };

type Student = { id: number; first_name: string; last_name: string; enrollment_code: string };

export default function ParentStudentsPage() {
  const { t } = useTranslation();
  const [relations, setRelations] = useState<ParentStudent[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ parent: "", student: "", relationship: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const tk = getToken();
      const [relationsRes, parentsRes, studentsRes] = await Promise.all([
        listParentStudents({}, tk),
        listUsers({ role: "PADRE" }, tk),
        listStudents({}, tk),
      ]);
      setRelations(Array.isArray(relationsRes?.results) ? relationsRes.results : relationsRes);
      setParents(Array.isArray(parentsRes?.results) ? parentsRes.results : parentsRes);
      setStudents(Array.isArray(studentsRes?.results) ? studentsRes.results : studentsRes);
    } catch (err: any) {
      setError(err.message || t("ParentStudents.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const parentMap = useMemo(() => new Map(parents.map((p) => [p.id, p])), [parents]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const filteredRelations = relations.filter((relation) => {
    const parent = parentMap.get(relation.parent);
    const student = studentMap.get(relation.student);
    const parentText = parent ? `${parent.first_name} ${parent.last_name} ${parent.email}`.toLowerCase() : "";
    const studentText = student ? `${student.first_name} ${student.last_name} ${student.enrollment_code}`.toLowerCase() : "";
    return (
      (!filters.parent || parentText.includes(filters.parent.toLowerCase())) &&
      (!filters.student || studentText.includes(filters.student.toLowerCase())) &&
      (!filters.relationship || relation.relationship.toLowerCase().includes(filters.relationship.toLowerCase()))
    );
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("ParentStudents.confirmDelete"))) return;
    try {
      const tk = getToken();
      await deleteParentStudent(id, tk);
      await load();
    } catch (err: any) {
      setError(err.message || t("ParentStudents.error"));
    }
  };

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("ParentStudents.pill", { defaultValue: "Vínculos" })}</span>
            <h2>{t("ParentStudents.header")}</h2>
            <p className="subtle">{t("ParentStudents.subtitle", { defaultValue: "Relaciona padres con alumnos." })}</p>
          </div>
          <Link className="button secondary" href="/parent-students/create">{t("ParentStudents.create")}</Link>
        </header>
        <form aria-labelledby="parent-student-filters" className="card form">
          <h3 id="parent-student-filters">{t("ParentStudents.filters")}</h3>
          <label>
            <span>{t("ParentStudents.filterParent")}</span>
            <input
              aria-label={t("ParentStudents.filterParent")}
              value={filters.parent}
              onChange={(e) => setFilters({ ...filters, parent: e.target.value })}
            />
          </label>
          <label>
            <span>{t("ParentStudents.filterStudent")}</span>
            <input
              aria-label={t("ParentStudents.filterStudent")}
              value={filters.student}
              onChange={(e) => setFilters({ ...filters, student: e.target.value })}
            />
          </label>
          <label>
            <span>{t("ParentStudents.filterRelationship")}</span>
            <input
              aria-label={t("ParentStudents.filterRelationship")}
              value={filters.relationship}
              onChange={(e) => setFilters({ ...filters, relationship: e.target.value })}
            />
          </label>
        </form>
        {loading && <p className="subtle">{t("ParentStudents.loading")}</p>}
        {error && <p className="alert error" role="alert">{error}</p>}
        <table aria-label={t("ParentStudents.tableAria")}>
          <thead>
            <tr>
              <th>{t("ParentStudents.parent")}</th>
              <th>{t("ParentStudents.student")}</th>
              <th>{t("ParentStudents.relationship")}</th>
              <th>{t("ParentStudents.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRelations.map((relation) => {
              const parent = parentMap.get(relation.parent);
              const student = studentMap.get(relation.student);
              return (
                <tr key={relation.id}>
                  <td>{parent ? `${parent.first_name} ${parent.last_name}` : relation.parent}</td>
                  <td>{student ? `${student.first_name} ${student.last_name}` : relation.student}</td>
                  <td>{relation.relationship}</td>
                  <td>
                    <button className="button secondary" type="button" onClick={() => handleDelete(relation.id)}>
                      {t("ParentStudents.delete")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </RequireRole>
  );
}
