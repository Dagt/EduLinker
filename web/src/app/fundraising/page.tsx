"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Event = { id: number; name: string; date: string; description: string };

type FormData = { name: string; date: string; description: string };

export default function FundraisingPage(){
  const [events, setEvents] = useState<Event[]>([]);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Event[]>("/fundraising-events/", tk);
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function onSubmit(data: FormData){
    try {
      const tk = getToken();
      const created = await apiPost<Event>("/fundraising-events/", data, tk);
      setEvents([...events, created]);
      reset();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>Recaudación</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder="Nombre" {...register("name", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <input placeholder="Fecha" {...register("date", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder="Descripción" {...register("description")}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>Crear</button>
        </form>
        <ul>
          {events.map(ev => (
            <li key={ev.id}><strong>{ev.name}</strong> - {ev.date}</li>
          ))}
        </ul>
      </main>
    </>
  );
}
