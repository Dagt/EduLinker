"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { getToken } from "@/lib/auth";
import { listStudents } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

type StudentRow = {
  id: number;
  first_name: string;
  last_name: string;
  grade_level: number;
  enrollment_code: string;
};

export default function StudentList() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [filters, setFilters] = useState({ name: "", grade_level: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const tk = getToken();
      const data = await listStudents(
        {
          name: filters.name || undefined,
          grade_level: filters.grade_level || undefined,
        },
        tk,
      );
      setStudents(Array.isArray(data?.results) ? data.results : data);
    } catch (err: any) {
      setError(err.message || t("StudentList.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function submitFilters(e: React.FormEvent) {
    e.preventDefault();
    await load();
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("StudentList.pill", { defaultValue: "Alumnos" })}</span>
            <h2>{t("StudentList.header")}</h2>
            <p className="subtle">{t("StudentList.subtitle", { defaultValue: "Consulta y administra alumnos." })}</p>
          </div>
          <Link className="button secondary" href="/students/create">
            {t("StudentList.create")}
          </Link>
        </header>
        <form className="card form" onSubmit={submitFilters}>
          <input
            placeholder={t("StudentList.filterName")}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            placeholder={t("StudentList.filterGrade")}
            value={filters.grade_level}
            onChange={(e) => setFilters({ ...filters, grade_level: e.target.value })}
          />
          <button className="button" type="submit">{t("StudentList.applyFilters")}</button>
        </form>
        {loading && <p className="subtle">{t("StudentList.loading")}</p>}
        {error && <p className="alert error">{error}</p>}
        <table>
          <thead>
            <tr>
              <th>{t("StudentList.name")}</th>
              <th>{t("StudentList.grade")}</th>
              <th>{t("StudentList.enrollment")}</th>
              <th>{t("StudentList.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.first_name} {student.last_name}</td>
                <td>{student.grade_level}</td>
                <td>{student.enrollment_code}</td>
                <td>
                  <Link className="link" href={`/students/edit?id=${student.id}`}>{t("StudentList.edit")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </RequireRole>
  );
}
