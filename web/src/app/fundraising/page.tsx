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

  if (!allowed) return <p>{t("Fundraising.unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t("Fundraising.header")}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder={t("Fundraising.name")} {...register("name", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <input placeholder={t("Fundraising.date")} {...register("date", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder={t("Fundraising.description")} {...register("description")}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>{t("Fundraising.create")}</button>
        </form>
        <ul>
          {events.map(ev => (
            <li key={ev.id}>
              <Link href={`/fundraising/${ev.id}`}>
                <Trans
                  i18nKey="Fundraising.eventItem"
                  values={{ name: ev.name, date: ev.date }}
                  components={{ b: <strong /> }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
