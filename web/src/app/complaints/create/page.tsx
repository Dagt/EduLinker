"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function ComplaintCreate(){
  const [groupId,setGroupId]=useState("");
  const [teacherId,setTeacherId]=useState("");
  const [studentId,setStudentId]=useState("");
  const [description,setDescription]=useState("");
  const [msg,setMsg]=useState("");
  const t = useTranslations("ComplaintCreate");

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      const body:any = {
        group_id: Number(groupId),
        target_teacher_id: Number(teacherId),
        description
      };
      if (studentId) body.about_student_id = Number(studentId);
      const res = await apiPost<any>("/complaints/", body, tk);
      setMsg(t("created", {id: res.id}));
      setGroupId(""); setTeacherId(""); setStudentId(""); setDescription("");
    }catch(err:any){ setMsg(err.message || t("error")); }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>{t("header")}</h2>
        <form onSubmit={submit}>
          <input placeholder={t("groupId")} value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder={t("teacherId")} value={teacherId} onChange={e=>setTeacherId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder={t("studentId")} value={studentId} onChange={e=>setStudentId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <textarea placeholder={t("description")} value={description} onChange={e=>setDescription(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:140}} required/>
          <button>{t("create")}</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
