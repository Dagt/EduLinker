import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { getSurvey, voteSurvey, getSurveyResults } from "../api";

type Props = { surveyId: number; onBack?: () => void };

export default function SurveyVote({ surveyId, onBack }: Props){
  const [survey, setSurvey] = useState<any|null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [msg,setMsg]=useState("");

  useEffect(()=>{ (async()=>{
    try{ const data = await getSurvey(surveyId); setSurvey(data); }catch{}
    try{ const res = await getSurveyResults(surveyId); setResults(res.results || {}); }catch{}
  })(); },[surveyId]);

  async function vote(idx: number){
    try{
      await voteSurvey(surveyId, idx);
      setMsg("Voto registrado");
      const res = await getSurveyResults(surveyId);
      setResults(res.results || {});
    }catch(err:any){ setMsg(err.message || "Error"); }
  }

  if(!survey) return <Text>Cargando...</Text>;

  return (
    <View style={{padding:16}}>
      {onBack ? <Button title="Volver" onPress={onBack} /> : null}
      <Text style={{fontSize:18, marginBottom:8}}>{survey.title}</Text>
      {survey.options.map((opt:string, idx:number)=>(
        <Button key={idx} title={opt} onPress={()=>vote(idx)} />
      ))}
      {msg? <Text>{msg}</Text>: null}
      {Object.keys(results).length>0 && (
        <View style={{marginTop:16}}>
          <Text>Resultados:</Text>
          {survey.options.map((opt:string, idx:number)=>(
            <Text key={idx}>{opt}: {results[String(idx)] || 0}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
