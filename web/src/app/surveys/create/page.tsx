"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";

type FormData = {
  scope: "GROUP" | "SCHOOL";
  groupId?: string;
  title: string;
  options: string;
  startAt: string;
  endAt: string;
};

export default function CreateSurvey(){
  const { register, handleSubmit, watch, reset, formState:{ errors } } = useForm<FormData>({ defaultValues:{ scope:"GROUP" } });
  const [msg,setMsg]=useState("");
  const t = useTranslations("SurveyCreate");

  const scope = watch("scope");

  async function onSubmit(data: FormData){
    setMsg("");
    const tk = getToken();
    const opts = data.options.split(",").map(s=>s.trim()).filter(Boolean);
    await apiPost("/surveys/", {
      scope: data.scope,
      group: data.scope === "GROUP" ? Number(data.groupId) : null,
      title: data.title,
      description: "",
      options: opts,
      is_anonymous: true,
      start_at: data.startAt,
      end_at: data.endAt
    }, tk);
    setMsg(t("created"));
    reset({ scope:"GROUP", groupId:"", title:"", options:"", startAt:"", endAt:"" });
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>{t("header")}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <select {...register("scope")} style={{display:"block",margin:"8px 0",padding:8}}>
            <option value="GROUP">{t("byGroup")}</option>
            <option value="SCHOOL">{t("wholeSchool")}</option>
          </select>
          {scope === "GROUP" && (
            <>
              <input
                placeholder={t("groupId")}
                {...register("groupId", { required: scope === "GROUP" })}
                style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}
              />
              {errors.groupId && <p style={{color:"red"}}>Required</p>}
            </>
          )}
          <input
            placeholder={t("title")}
            {...register("title", { required: true })}
            style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}
          />
          {errors.title && <p style={{color:"red"}}>Required</p>}
          <input
            placeholder={t("start")}
            {...register("startAt", { required: true })}
            style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}
          />
          {errors.startAt && <p style={{color:"red"}}>Required</p>}
          <input
            placeholder={t("end")}
            {...register("endAt", { required: true })}
            style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}
          />
          {errors.endAt && <p style={{color:"red"}}>Required</p>}
          <input
            placeholder={t("options")}
            {...register("options", { required: true })}
            style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}
          />
          {errors.options && <p style={{color:"red"}}>Required</p>}
          <button>{t("create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
