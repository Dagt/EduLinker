"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

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
  const { t } = useTranslation();

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
    setMsg(t("SurveyCreate.created"));
    reset({ scope:"GROUP", groupId:"", title:"", options:"", startAt:"", endAt:"" });
  }

  return (
    <>
      <Nav/>
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("SurveyCreate.pill", { defaultValue: "Encuestas" })}</span>
            <h2>{t("SurveyCreate.header")}</h2>
            <p className="subtle">
              {t("SurveyCreate.subtitle", { defaultValue: "Define el alcance y el periodo de participacion." })}
            </p>
          </div>
        </header>
        <section className="card">
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <label>
              {t("SurveyCreate.scope", { defaultValue: "Alcance" })}
              <select {...register("scope")}>
                <option value="GROUP">{t("SurveyCreate.byGroup")}</option>
                <option value="SCHOOL">{t("SurveyCreate.wholeSchool")}</option>
              </select>
            </label>
            {scope === "GROUP" && (
              <label>
                {t("SurveyCreate.groupId")}
                <input
                  placeholder={t("SurveyCreate.groupId")}
                  {...register("groupId", { required: scope === "GROUP" })}
                />
                {errors.groupId && <span className="meta">{t("Form.required", { defaultValue: "Requerido" })}</span>}
              </label>
            )}
            <label>
              {t("SurveyCreate.title")}
              <input placeholder={t("SurveyCreate.title")} {...register("title", { required: true })} />
              {errors.title && <span className="meta">{t("Form.required", { defaultValue: "Requerido" })}</span>}
            </label>
            <label>
              {t("SurveyCreate.start")}
              <input placeholder={t("SurveyCreate.start")} {...register("startAt", { required: true })} />
              {errors.startAt && <span className="meta">{t("Form.required", { defaultValue: "Requerido" })}</span>}
            </label>
            <label>
              {t("SurveyCreate.end")}
              <input placeholder={t("SurveyCreate.end")} {...register("endAt", { required: true })} />
              {errors.endAt && <span className="meta">{t("Form.required", { defaultValue: "Requerido" })}</span>}
            </label>
            <label>
              {t("SurveyCreate.options")}
              <input placeholder={t("SurveyCreate.options")} {...register("options", { required: true })} />
              {errors.options && <span className="meta">{t("Form.required", { defaultValue: "Requerido" })}</span>}
            </label>
            <div className="form-actions">
              <button className="button" type="submit">{t("SurveyCreate.create")}</button>
            </div>
          </form>
        </section>
        {msg && <p className="alert success">{msg}</p>}
      </main>
    </>
  );
}
