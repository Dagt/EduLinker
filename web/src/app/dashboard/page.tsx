"use client";
import {useEffect, useState} from "react";
import Nav from "@/components/Nav";
import {getToken} from "@/lib/auth";
import {apiGet} from "@/lib/api";
import {NextIntlClientProvider, useTranslations} from 'next-intl';
import esMessages from "@/i18n/es.json";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

function DashboardContent(){
  const [me,setMe]=useState<any>();
  const [kpis,setKpis]=useState<any>();
  const t = useTranslations('Dashboard');

  const loadData = async () => {
    const tk = getToken();
    const k = await apiGet<any>("/analytics/overview/", tk);
    setKpis(k);
  };

  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const m = await apiGet<any>("/me/", tk);
    setMe(m);
    await loadData();
  })(); },[]);
  const name = me ? `${me.first_name} ${me.last_name}` : '';
  const complaintsData = kpis?.complaints_by_group?.map((c:any)=>({name:c.group, total:c.total}))||[];
  const fundraisingData = kpis?.fundraising_by_group?.map((f:any)=>({name:f.group__id, total:parseFloat(f.total)}))||[];
  const surveysData = kpis?.surveys_participation?.map((s:any)=>({name:s.survey__group, total:s.votes}))||[];

  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>{t('welcome', {name})}</h2>
        <button onClick={loadData}>Actualizar</button>
        {kpis ? (
          <div>
            <h3>Quejas</h3>
            <BarChart width={300} height={200} data={complaintsData} data-testid="complaints-chart">
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>

            <h3>Recaudaciones</h3>
            <BarChart width={300} height={200} data={fundraisingData} data-testid="fundraising-chart">
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>

            <h3>Encuestas</h3>
            <BarChart width={300} height={200} data={surveysData} data-testid="surveys-chart">
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#ffc658" />
            </BarChart>
          </div>
        ) : (
          <p>Cargando...</p>
        )}
      </main>
    </>
  );
}

export default function Dashboard(){
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      <DashboardContent/>
    </NextIntlClientProvider>
  );
}
