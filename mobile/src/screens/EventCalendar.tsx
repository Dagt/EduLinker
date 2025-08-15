import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";
import { getRole } from "../role";

export default function EventCalendar(){
  const [events,setEvents]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  useEffect(()=>{ (async()=>{ setRole(await getRole()); const r = await apiGet("/events/"); setEvents(r); })(); },[]);
  if(role==="guest") return <Text>No autorizado</Text>;
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Calendario</Text>
      <FlatList data={events} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title} ({item.date})</Text>} />
    </View>
  );
}
