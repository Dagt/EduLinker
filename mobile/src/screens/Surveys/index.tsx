import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../../api";

export default function Surveys(){
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ try{ const data = await apiGet("/surveys/"); setItems(data); }catch{ setItems([]);} })(); },[]);
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Encuestas</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay encuestas</Text>}
        renderItem={({item})=> <Text>- {item.title || item.name}</Text>} />
    </View>
  );
}
