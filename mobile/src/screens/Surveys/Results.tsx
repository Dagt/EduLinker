import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { getSurvey, getSurveyResults } from "../../api";
import i18n from "../../i18n";

type Props = { surveyId: number; onBack?: () => void };

export default function SurveyResults({ surveyId, onBack }: Props){
  const [survey, setSurvey] = useState<any|null>(null);
  const [results, setResults] = useState<Record<string, number>>({});

  useEffect(()=>{ (async()=>{
    try{ const data = await getSurvey(surveyId); setSurvey(data); }catch{}
    try{ const res = await getSurveyResults(surveyId); setResults(res.results || {}); }catch{}
  })(); },[surveyId]);

  if(!survey) return <Text>{i18n.t("general.loading")}</Text>;

  return (
    <View style={{padding:16}}>
      {onBack ? <Button title={i18n.t("general.back")} onPress={onBack} /> : null}
      <Text style={{fontSize:18, marginBottom:8}}>{survey.title}</Text>
      <Text>{i18n.t("surveys.resultsLabel")}</Text>
      {survey.options.map((opt:string, idx:number)=> (
        <Text key={idx}>{opt}: {results[String(idx)] || 0}</Text>
      ))}
    </View>
  );
}
