import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";
import { getRole } from "../role";
import i18n from "../i18n";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  useEffect(()=>{ (async()=>{ setRole(await getRole()); const r = await apiGet("/suggestions/"); setItems(r); })(); },[]);
  if(role==="guest") return <Text>{i18n.t('suggestions.unauthorized')}</Text>;
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('suggestions.title')}</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title}</Text>} />
    </View>
  );
}
