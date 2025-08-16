import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getSurveys } from "../../api";
import SurveyVote from "./Vote";

export default function Surveys(){
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<number|null>(null);

  useEffect(()=>{
    (async()=>{
      try{
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
  if(selected!==null){
    return <SurveyVote surveyId={selected} onBack={()=>setSelected(null)} />;
  }
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Encuestas</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay encuestas</Text>}
        renderItem={({item})=> {
          const active = isActive(item);
          return (
            <TouchableOpacity onPress={()=>active && setSelected(item.id)} disabled={!active}>
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
