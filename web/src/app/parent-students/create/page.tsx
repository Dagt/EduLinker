"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { getToken } from "@/lib/auth";
import { createParentStudent, listStudents, listUsers } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

type User = { id: number; first_name: string; last_name: string; email: string };

type Student = { id: number; first_name: string; last_name: string; enrollment_code: string; grade_level: number };

export default function ParentStudentCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parentQuery, setParentQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const tk = getToken();
        const parentRes = await listUsers({ role: "PADRE", name: parentQuery || undefined }, tk);
        setParents(Array.isArray(parentRes?.results) ? parentRes.results : parentRes);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [parentQuery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const tk = getToken();
        const studentRes = await listStudents({ name: studentQuery || undefined }, tk);
        setStudents(Array.isArray(studentRes?.results) ? studentRes.results : studentRes);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [studentQuery]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tk = getToken();
      await createParentStudent(
        {
          parent: Number(parentId),
          student: Number(studentId),
          relationship,
        },
        tk,
      );
      router.push("/parent-students");
    } catch (err: any) {
      setError(err.message || t("ParentStudentsCreate.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("ParentStudentsCreate.pill", { defaultValue: "Vinculos" })}</span>
            <h2>{t("ParentStudentsCreate.header")}</h2>
            <p className="subtle">
              {t("ParentStudentsCreate.subtitle", { defaultValue: "Relaciona padres con estudiantes." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form
            aria-labelledby="parent-student-create"
            onSubmit={submit}
            className="form"
          >
            <h3 id="parent-student-create">{t("ParentStudentsCreate.formTitle")}</h3>
            <label>
              {t("ParentStudentsCreate.parentSearch")}
              <input
                aria-label={t("ParentStudentsCreate.parentSearch")}
                value={parentQuery}
                onChange={(e) => setParentQuery(e.target.value)}
              />
            </label>
            <label>
              {t("ParentStudentsCreate.parentSelect")}
              <select
                aria-label={t("ParentStudentsCreate.parentSelect")}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                required
              >
                <option value="">{t("ParentStudentsCreate.selectPlaceholder")}</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.first_name} {parent.last_name} ({parent.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("ParentStudentsCreate.studentSearch")}
              <input
                aria-label={t("ParentStudentsCreate.studentSearch")}
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
              />
            </label>
            <label>
              {t("ParentStudentsCreate.studentSelect")}
              <select
                aria-label={t("ParentStudentsCreate.studentSelect")}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">{t("ParentStudentsCreate.selectPlaceholder")}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} - {student.enrollment_code} - {student.grade_level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("ParentStudentsCreate.relationship")}
              <input
                aria-label={t("ParentStudentsCreate.relationship")}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
              />
            </label>
            <div className="form-actions">
              <button className="button" type="submit" disabled={loading}>
                {loading ? t("ParentStudentsCreate.saving") : t("ParentStudentsCreate.save")}
              </button>
            </div>
            {error && <p className="alert error" role="alert">{error}</p>}
          </form>
        </section>
      </main>
    </RequireRole>
  );
}
