import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";
import i18n from "../i18n";

export default function Feed(){
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{ (async()=>{ const data = await apiGet("/feed/"); setItems(data); })(); },[]);
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t("feed.title")}</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title || item.content}</Text>} />
    </View>
  );
}
