import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button } from "react-native";
import { getSurveys } from "../../api";
import { getRole } from "../../role";
import i18n from "../../i18n";
import SurveyVote from "./Vote";
import SurveyResults from "./Results";

export default function Surveys({ onCreate }: { onCreate?: () => void }){
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<{id:number,type:'vote'|'results'}|null>(null);
  const [role, setRole] = useState("guest");

  useEffect(()=>{
    (async()=>{
      try{
        setRole(await getRole());
        const data = await getSurveys();
        setItems(data);
      }catch{
        setItems([]);
      }
    })();
  },[]);

  function isActive(item: any){
    const now = new Date();
    return (
      item.status === "ACTIVE" &&
      new Date(item.start_at) <= now &&
      new Date(item.end_at) >= now
    );
  }
  if(selected){
    return selected.type === 'vote'
      ? <SurveyVote surveyId={selected.id} onBack={()=>setSelected(null)} />
      : <SurveyResults surveyId={selected.id} onBack={()=>setSelected(null)} />;
  }
  const canCreate = ["DIRECTOR","MAESTRO_TITULAR","MAESTRO_ITINERANTE","VOCAL"].includes(role);
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Encuestas</Text>
      {canCreate && onCreate ? (
        <Button title={i18n.t('surveys.create')} onPress={onCreate} />
      ) : null}
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay encuestas</Text>}
        renderItem={({item})=> {
          const active = isActive(item);
          return (
            <TouchableOpacity onPress={()=>setSelected({id:item.id, type: active ? 'vote' : 'results'})}>
              <Text>
                - {item.title || item.name}
                {!active ? " (cerrada)" : ""}
              </Text>
            </TouchableOpacity>
          );
        }} />
    </View>
  );
}
