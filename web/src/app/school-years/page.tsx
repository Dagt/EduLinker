"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { createSchoolYear, listSchoolYears, rolloverSchoolYear, setCurrentSchoolYear } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

type SchoolYear = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export default function SchoolYearsPage() {
  const { t } = useTranslation();
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", is_current: true });
  const [rollover, setRollover] = useState({ from_year: "", to_year: "", dry_run: true });

  async function load() {
    try {
      const tk = getToken();
      const data = await listSchoolYears(tk);
      const list = Array.isArray(data) ? data : data?.results || [];
      setYears(list);
    } catch (err: any) {
      setError(err?.message || t("SchoolYears.error", { defaultValue: "Error al cargar ciclos." }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const tk = getToken();
      await createSchoolYear({
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        is_current: form.is_current,
      }, tk);
      setStatus(t("SchoolYears.created", { defaultValue: "Ciclo creado." }));
      setForm({ name: "", start_date: "", end_date: "", is_current: true });
      await load();
    } catch (err: any) {
      setError(err?.message || t("SchoolYears.createError", { defaultValue: "No se pudo crear." }));
    }
  }

  async function handleSetCurrent(id: number) {
    setError("");
    setStatus("");
    try {
      const tk = getToken();
      await setCurrentSchoolYear(id, tk);
      setStatus(t("SchoolYears.updated", { defaultValue: "Ciclo actualizado." }));
      await load();
    } catch (err: any) {
      setError(err?.message || t("SchoolYears.updateError", { defaultValue: "No se pudo actualizar." }));
    }
  }

  async function handleRollover(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const tk = getToken();
      const res = await rolloverSchoolYear({
        from_year: Number(rollover.from_year),
        to_year: Number(rollover.to_year),
        dry_run: rollover.dry_run,
      }, tk);
      setStatus(res?.detail || t("SchoolYears.rolloverOk", { defaultValue: "Rollover ejecutado." }));
    } catch (err: any) {
      setError(err?.message || t("SchoolYears.rolloverError", { defaultValue: "No se pudo ejecutar rollover." }));
    }
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("SchoolYears.pill", { defaultValue: "Ciclos" })}</span>
            <h2>{t("SchoolYears.header", { defaultValue: "Ciclos escolares" })}</h2>
            <p className="subtle">
              {t("SchoolYears.subtitle", { defaultValue: "Administra periodos y rollover." })}
            </p>
          </div>
        </header>

        {error && <p className="alert error">{error}</p>}
        {status && <p className="alert success">{status}</p>}

        <section className="grid-2">
          <section className="card">
            <h3>{t("SchoolYears.create", { defaultValue: "Crear ciclo" })}</h3>
            <form className="form" onSubmit={handleCreate}>
              <label>
                {t("SchoolYears.name", { defaultValue: "Nombre" })}
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>
                {t("SchoolYears.start", { defaultValue: "Inicio" })}
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
              </label>
              <label>
                {t("SchoolYears.end", { defaultValue: "Fin" })}
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
              </label>
              <label className="option">
                <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
                {t("SchoolYears.setCurrent", { defaultValue: "Marcar como vigente" })}
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("SchoolYears.save", { defaultValue: "Guardar" })}</button>
              </div>
            </form>
          </section>

          <section className="card">
            <h3>{t("SchoolYears.rollover", { defaultValue: "Rollover" })}</h3>
            <form className="form" onSubmit={handleRollover}>
              <label>
                {t("SchoolYears.from", { defaultValue: "Desde" })}
                <select value={rollover.from_year} onChange={(e) => setRollover({ ...rollover, from_year: e.target.value })} required>
                  <option value="">{t("SchoolYears.select", { defaultValue: "Selecciona" })}</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </label>
              <label>
                {t("SchoolYears.to", { defaultValue: "Hacia" })}
                <select value={rollover.to_year} onChange={(e) => setRollover({ ...rollover, to_year: e.target.value })} required>
                  <option value="">{t("SchoolYears.select", { defaultValue: "Selecciona" })}</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </label>
              <label className="option">
                <input type="checkbox" checked={rollover.dry_run} onChange={(e) => setRollover({ ...rollover, dry_run: e.target.checked })} />
                {t("SchoolYears.dryRun", { defaultValue: "Simulacion" })}
              </label>
              <div className="form-actions">
                <button className="button" type="submit">{t("SchoolYears.run", { defaultValue: "Ejecutar" })}</button>
              </div>
            </form>
          </section>
        </section>

        <section className="section">
          <h3>{t("SchoolYears.list", { defaultValue: "Ciclos registrados" })}</h3>
          <table>
            <thead>
              <tr>
                <th>{t("SchoolYears.name", { defaultValue: "Nombre" })}</th>
                <th>{t("SchoolYears.start", { defaultValue: "Inicio" })}</th>
                <th>{t("SchoolYears.end", { defaultValue: "Fin" })}</th>
                <th>{t("SchoolYears.status", { defaultValue: "Estado" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.id}>
                  <td>{y.name}</td>
                  <td>{y.start_date}</td>
                  <td>{y.end_date}</td>
                  <td>{y.is_current ? t("SchoolYears.current", { defaultValue: "Vigente" }) : t("SchoolYears.inactive", { defaultValue: "Historico" })}</td>
                  <td>
                    {!y.is_current && (
                      <button className="button secondary" onClick={() => handleSetCurrent(y.id)}>
                        {t("SchoolYears.makeCurrent", { defaultValue: "Activar" })}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </RequireRole>
  );
}
