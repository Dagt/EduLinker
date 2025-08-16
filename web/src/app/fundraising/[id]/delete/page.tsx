"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getFundraisingEvent, deleteFundraisingEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type Event = { id:number; name:string; date:string; description:string };

export default function FundraisingDelete({ params }:{ params:{ id:string } }){
  const [ev, setEv] = useState<Event|null>(null);
  const [msg, setMsg] = useState("");
  const t = useTranslations("FundraisingDelete");

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

  async function handleDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try {
      const tk = getToken();
      await deleteFundraisingEvent(Number(params.id), tk);
      setMsg(t('deleted'));
    } catch (e:any) {
      setMsg(e.message || t('error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t('header')}</h2>
        {ev && <p>{ev.name}</p>}
        <button onClick={handleDelete}>{t('delete')}</button>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
