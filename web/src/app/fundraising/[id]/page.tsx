"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

type Event = { id:number; name:string; date:string; description:string };

export default function FundraisingDetail({ params }:{ params:{ id:string } }){
  const [ev, setEv] = useState<Event|null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Event>(`/fundraising-events/${params.id}`, tk);
        setEv(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id]);

  if (!ev) return <p>{t("FundraisingDetail.loading")}</p>;

  return (
    <>
      <Nav />
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("FundraisingDetail.pill", { defaultValue: "Recaudacion" })}</span>
            <h2>{t("FundraisingDetail.header", { id: ev.id })}</h2>
            <p className="subtle">{t("FundraisingDetail.subtitle", { defaultValue: "Detalle del evento." })}</p>
          </div>
          <div className="actions">
            <Link className="button secondary" href={`/fundraising/${ev.id}/edit`}>{t("FundraisingDetail.edit")}</Link>
            <Link className="button" href={`/fundraising/${ev.id}/delete`}>{t("FundraisingDetail.delete")}</Link>
          </div>
        </header>
        <section className="card stack">
          <div>
            <p className="meta">{t("FundraisingDetail.name")}</p>
            <p className="card-title">{ev.name}</p>
          </div>
          <div>
            <p className="meta">{t("FundraisingDetail.date")}</p>
            <p className="subtle">{ev.date}</p>
          </div>
          <div>
            <p className="meta">{t("FundraisingDetail.description")}</p>
            <p className="subtle">{ev.description}</p>
          </div>
        </section>
      </main>
    </>
  );
}
