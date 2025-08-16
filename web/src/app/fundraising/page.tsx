"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { listFundraisingEvents, createFundraisingEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { requireRole } from "@/lib/roles";
import Link from "next/link";

type Event = { id: number; name: string; date: string; description: string };

type FormData = { name: string; date: string; description: string };

export default function FundraisingPage(){
  const t = useTranslations("Fundraising");
  const [events, setEvents] = useState<Event[]>([]);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const allowed = requireRole(["admin"]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      try {
        const tk = getToken();
        const data = await listFundraisingEvents(tk);
        setEvents(data);
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

  if (!allowed) return <p>{t("unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t("header")}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t("name")} {...register("name", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <input placeholder={t("date")} {...register("date", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t("description")} {...register("description")}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t("create")}</button>
        </form>
        <ul>
          {events.map(ev => (
            <li key={ev.id}>
              <Link href={`/fundraising/${ev.id}`}><strong>{ev.name}</strong></Link> - {ev.date}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
