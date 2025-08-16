import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";
import { getRole } from "../role";

export default function FundraisingExpenses(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  useEffect(()=>{ (async()=>{
    setRole(await getRole());
    const r = await apiGet("/expense-evidences/");
    setItems(r);
  })(); },[]);
  if(role!=="treasurer" && role!=="admin") return <Text>No autorizado</Text>;
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Gastos de Recaudación</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.description}: {item.amount}</Text>} />
    </View>
  );
}
