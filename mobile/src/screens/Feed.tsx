import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";

export default function Feed(){
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{ (async()=>{ const data = await apiGet("/feed/"); setItems(data); })(); },[]);
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Mi feed</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title || item.content}</Text>} />
    </View>
  );
}
