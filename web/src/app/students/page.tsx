"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { listStudents } from "@/lib/api";
import { requireRole } from "@/lib/roles";
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

  if (!requireRole(["admin"])) return <p>{t("StudentList.unauthorized")}</p>;

  async function submitFilters(e: React.FormEvent) {
    e.preventDefault();
    await load();
  }

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("StudentList.header")}</h2>
        <p>
          <Link href="/students/create">{t("StudentList.create")}</Link>
        </p>
        <form onSubmit={submitFilters} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
          <input
            placeholder={t("StudentList.filterName")}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ padding: 8 }}
          />
          <input
            placeholder={t("StudentList.filterGrade")}
            value={filters.grade_level}
            onChange={(e) => setFilters({ ...filters, grade_level: e.target.value })}
            style={{ padding: 8 }}
          />
          <button type="submit">{t("StudentList.applyFilters")}</button>
        </form>
        {loading && <p>{t("StudentList.loading")}</p>}
        {error && <p>{error}</p>}
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>{t("StudentList.name")}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t("StudentList.grade")}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t("StudentList.enrollment")}</th>
              <th style={{ padding: 8 }}>{t("StudentList.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 8 }}>{student.first_name} {student.last_name}</td>
                <td style={{ padding: 8 }}>{student.grade_level}</td>
                <td style={{ padding: 8 }}>{student.enrollment_code}</td>
                <td style={{ padding: 8 }}>
                  <Link href={`/students/edit?id=${student.id}`}>{t("StudentList.edit")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
