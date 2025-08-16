import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { apiGet, createSuggestion } from "../api";
import { getRole } from "../role";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [groupId,setGroupId]=useState("");
  const [teacherId,setTeacherId]=useState("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");

  const loadSuggestions = async () => {
    const r = await apiGet("/suggestions/");
    setItems(r);
  };

  useEffect(()=>{ (async()=>{ setRole(await getRole()); await loadSuggestions(); })(); },[]);
  if(role==="guest") return <Text>No autorizado</Text>;

  const submitSuggestion = async () => {
    if(!groupId || !teacherId || !title || !description) return;
    await createSuggestion({
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      title,
      description,
    });
    setGroupId("");
    setTeacherId("");
    setTitle("");
    setDescription("");
    await loadSuggestions();
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Sugerencias</Text>
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <Button title="Enviar" onPress={submitSuggestion} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title}</Text>} />
    </View>
  );
}
