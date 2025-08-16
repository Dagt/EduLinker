"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getFundraisingEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Event = { id:number; name:string; date:string; description:string };

export default function FundraisingDetail({ params }:{ params:{ id:string } }){
  const [ev, setEv] = useState<Event|null>(null);
  const t = useTranslations("FundraisingDetail");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await getFundraisingEvent<Event>(Number(params.id), tk);
        setEv(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id]);

  if (!ev) return <p>{t('loading')}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t('header', { id: ev.id })}</h2>
        <p><strong>{t('name')}</strong> {ev.name}</p>
        <p><strong>{t('date')}</strong> {ev.date}</p>
        <p><strong>{t('description')}</strong> {ev.description}</p>
        <Link href={`/fundraising/${ev.id}/edit`}>{t('edit')}</Link>
        {" | "}
        <Link href={`/fundraising/${ev.id}/delete`}>{t('delete')}</Link>
      </main>
    </>
  );
}
