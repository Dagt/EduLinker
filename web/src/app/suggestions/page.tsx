"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Suggestion = { id: number; title: string; description: string };

type FormData = { title: string; description: string };

export default function SuggestionsPage(){
  const [items, setItems] = useState<Suggestion[]>([]);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion[]>("/suggestions/", tk);
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function onSubmit(data: FormData){
    try {
      const tk = getToken();
      const created = await apiPost<Suggestion>("/suggestions/", data, tk);
      setItems([...items, created]);
      reset();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>Sugerencias</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input placeholder="Título" {...register("title", {required:true})}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} />
          <textarea placeholder="Descripción" {...register("description")}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:120}} />
          <button>Enviar</button>
        </form>
        <ul>
          {items.map(s => (
            <li key={s.id}><strong>{s.title}</strong>: {s.description}</li>
          ))}
        </ul>
      </main>
    </>
  );
}
