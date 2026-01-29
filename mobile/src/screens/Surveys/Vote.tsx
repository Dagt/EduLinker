import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { getSurvey, voteSurvey, getSurveyResults } from "../../api";
import i18n from "../../i18n";

type Props = { surveyId: number; onBack?: () => void };

export default function SurveyVote({ surveyId, onBack }: Props){
  const [survey, setSurvey] = useState<any|null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [msg,setMsg]=useState("");
  const [hasVoted,setHasVoted]=useState(false);

  useEffect(()=>{ (async()=>{
    try{ const data = await getSurvey(surveyId); setSurvey(data); }catch{}
    try{ const res = await getSurveyResults(surveyId); setResults(res.results || {}); }catch{}
  })(); },[surveyId]);

  function isActive(){
    if(!survey) return false;
    const now = new Date();
    return survey.status === "ACTIVE" && new Date(survey.start_at) <= now && new Date(survey.end_at) >= now;
  }

  async function vote(idx: number){
    if(!isActive()){ setMsg(i18n.t("surveys.inactive")); return; }
    if(hasVoted){ setMsg(i18n.t("surveys.alreadyVoted")); return; }
    try{
      await voteSurvey(surveyId, idx);
      setHasVoted(true);
      setMsg(i18n.t("surveys.voteRecorded"));
      const res = await getSurveyResults(surveyId);
      setResults(res.results || {});
    }catch(err:any){ setMsg(err.message || i18n.t("general.error")); }
  }

  if(!survey) return <Text>{i18n.t("general.loading")}</Text>;
  const active = isActive();

  return (
    <View style={{padding:16}}>
      {onBack ? <Button title={i18n.t("general.back")} onPress={onBack} /> : null}
      <Text style={{fontSize:18, marginBottom:8}}>{survey.title}</Text>
      {!active && <Text style={{marginBottom:8}}>{i18n.t("surveys.inactive")}</Text>}
      {survey.options.map((opt:string, idx:number)=>(
        <Button key={idx} title={opt} onPress={()=>vote(idx)} disabled={!active} />
      ))}
      {msg? <Text>{msg}</Text>: null}
      {Object.keys(results).length>0 && (
        <View style={{marginTop:16}}>
          <Text>{i18n.t("surveys.resultsLabel")}</Text>
          {survey.options.map((opt:string, idx:number)=>(
            <Text key={idx}>{opt}: {results[String(idx)] || 0}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
