"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { apiPost } from "@/lib/api";

export default function ComplaintCreate(){
  const [groupId,setGroupId]=useState("");
  const [teacherId,setTeacherId]=useState("");
  const [studentId,setStudentId]=useState("");
  const [description,setDescription]=useState("");
  const [msg,setMsg]=useState("");

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
      const res = await apiPost("/complaints/", body, tk);
      setMsg(`Queja creada #${res.id}`);
      setGroupId(""); setTeacherId(""); setStudentId(""); setDescription("");
    }catch(err:any){ setMsg(err.message || "Error al crear queja"); }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:680}}>
        <h2>Crear queja privada</h2>
        <form onSubmit={submit}>
          <input placeholder="Group ID" value={groupId} onChange={e=>setGroupId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="Target Teacher ID" value={teacherId} onChange={e=>setTeacherId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}} required/>
          <input placeholder="About Student ID (opcional)" value={studentId} onChange={e=>setStudentId(e.target.value)}
                 style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
          <textarea placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)}
                    style={{display:"block",margin:"8px 0",padding:8,width:"100%",minHeight:140}} required/>
          <button>Crear queja</button>
        </form>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
