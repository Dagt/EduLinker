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
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t("FundraisingDetail.header", { id: ev.id })}</h2>
        <p><strong>{t("FundraisingDetail.name")}</strong> {ev.name}</p>
        <p><strong>{t("FundraisingDetail.date")}</strong> {ev.date}</p>
        <p><strong>{t("FundraisingDetail.description")}</strong> {ev.description}</p>
        <Link href={`/fundraising/${ev.id}/edit`}>{t("FundraisingDetail.edit")}</Link>
        <br />
        <Link href={`/fundraising/${ev.id}/delete`}>{t("FundraisingDetail.delete")}</Link>
      </main>
    </>
  );
}
