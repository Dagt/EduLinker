import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getSuggestions, createSuggestion } from "../api";
import { getRole } from "../role";
import i18n from "../i18n";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [content,setContent]=useState("");
  const [groupId,setGroupId]=useState("");
  const [teacherId,setTeacherId]=useState("");
  const [studentId,setStudentId]=useState("");

  const loadSuggestions = async () => {
    try{
      const r = await getSuggestions();
      setItems(r);
    }catch{
      setItems([]);
    }
  };

  useEffect(()=>{ (async()=>{ const r = await getRole(); setRole(r); if(r!=="guest") await loadSuggestions(); })(); },[]);
  if(role==="guest") return <Text>{i18n.t('suggestions.unauthorized')}</Text>;

  const submitSuggestion = async () => {
    if(!content || !groupId || !teacherId){
      Alert.alert(i18n.t('general.error'), i18n.t('complaints.requiredComplaint'));
      return;
    }
    await createSuggestion({
      content,
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      ...(studentId ? { about_student_id: Number(studentId) } : {})
    });
    setContent("");
    setGroupId("");
    setTeacherId("");
    setStudentId("");
    await loadSuggestions();
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('suggestions.title')}</Text>
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder="Student ID (optional)" value={studentId} onChangeText={setStudentId} />
      <TextInput placeholder="Suggestion" value={content} onChangeText={setContent} />
      <Button title={i18n.t('complaints.send')} onPress={submitSuggestion} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text>- {item.title || item.content}</Text>} />
    </View>
  );
}

