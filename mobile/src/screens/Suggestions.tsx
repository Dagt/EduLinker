import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { apiGet, createSuggestion } from "../api";
import { getRole } from "../role";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  
  async function send(){
    try{
      const created = await createSuggestion({ title, description });
      setItems([...items, created]);
      setTitle("");
      setDescription("");
    }catch(e:any){ Alert.alert("Error", e.message || "No se pudo enviar"); }
  }
  useEffect(()=>{ (async()=>{ setRole(await getRole()); const r = await apiGet("/suggestions/"); setItems(r); })(); },[]);
  if(role==="guest") return <Text>No autorizado</Text>;
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Sugerencias</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Título"
        style={{borderWidth:1,padding:8,marginBottom:8}} />
      <TextInput value={description} onChangeText={setDescription} placeholder="Descripción"
        style={{borderWidth:1,padding:8,marginBottom:8,minHeight:80}} multiline />
      <Button title="Enviar" onPress={send} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title}</Text>} />
    </View>
  );
}
