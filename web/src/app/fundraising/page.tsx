"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { listFundraisingEvents, createFundraisingEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation, Trans } from "react-i18next";
import "@/i18n";
import Link from "next/link";
import { requireRole } from "@/lib/roles";

type Event = { id: number; name: string; date: string; description: string };

type FormData = { name: string; date: string; description: string };

export default function FundraisingPage(){
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const allowed = requireRole(["admin", "director"]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const tk = getToken();
        const data = await listFundraisingEvents(tk);
        const list = Array.isArray(data) ? data : data.results || [];
        setEvents(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [allowed]);

  async function onSubmit(data: FormData){
    try {
      const tk = getToken();
      const created = await createFundraisingEvent(data, tk);
      setEvents([...events, created]);
      reset();
    } catch (e) {
      console.error(e);
    }
  }

  if (!allowed) return <p>{t("Fundraising.unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">{t("Fundraising.pill", { defaultValue: "Recaudación" })}</span>
            <h2>{t("Fundraising.header")}</h2>
            <p className="subtle">
              {t("Fundraising.subtitle", { defaultValue: "Organiza eventos y controla ingresos y gastos." })}
            </p>
          </div>
          <div className="actions">
            <Link className="button secondary" href="/fundraising/ledger">
              {t("Fundraising.ledger", { defaultValue: "Registrar ingresos" })}
            </Link>
            <Link className="button secondary" href="/fundraising/expense">
              {t("Fundraising.expense", { defaultValue: "Subir evidencia" })}
            </Link>
          </div>
        </header>
        <section className="card form">
          <h3>{t("Fundraising.create", { defaultValue: "Crear evento" })}</h3>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <input
              placeholder={t("Fundraising.name")}
              {...register("name", { required: true })}
            />
            {errors.name && <p className="alert error">{t("Validation.required")}</p>}
            <input
              placeholder={t("Fundraising.date")}
              {...register("date", { required: true })}
            />
            {errors.date && <p className="alert error">{t("Validation.required")}</p>}
            <textarea
              placeholder={t("Fundraising.description")}
              {...register("description")}
            />
            <button className="button" type="submit">
              {t("Fundraising.create")}
            </button>
          </form>
        </section>
        <section className="grid cards">
          {events.map((ev) => (
            <article key={ev.id} className="card">
              <div className="card-header">
                <span className="chip">EVENTO</span>
                <span className="meta">#{ev.id}</span>
              </div>
              <p className="card-title">{ev.name}</p>
              <p className="subtle">{ev.date}</p>
              <div className="card-footer">
                <span className="meta">{ev.description || "—"}</span>
                <Link className="link" href={`/fundraising/${ev.id}`}>
                  {t("Fundraising.view", { defaultValue: "Ver detalle" })}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
