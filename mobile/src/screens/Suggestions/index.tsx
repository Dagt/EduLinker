import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import {
  getSuggestions,
  createSuggestion,
  getSuggestionMessages,
  sendSuggestionMessage,
} from "../../api";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [aboutStudentId, setAboutStudentId] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError(false);
    try{
      const r = await getSuggestions();
      setItems(r);
    }catch{
      setItems([]);
      setError(true);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ (async()=>{ setRole(await getRole()); await load(); })(); },[]);

  const submit = async () => {
    if(!title || !description || !groupId || !teacherId){
      Alert.alert(i18n.t('general.error'), i18n.t('suggestions.title'));
      return;
    }
    const created = await createSuggestion({
      title,
      description,
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      ...(aboutStudentId ? { about_student_id: Number(aboutStudentId) } : {}),
    });
    setItems([...items, created]);
    setTitle("");
    setDescription("");
    setGroupId("");
    setTeacherId("");
    setAboutStudentId("");
  };

  const openSuggestion = async (s: any) => {
    setSelected(s);
    try{
      const msgs = await getSuggestionMessages(s.id);
      setSelected({ ...s, messages: msgs });
    }catch{
      setSelected({ ...s, messages: [] });
    }
  };

  const sendMsg = async () => {
    if(!selected) return;
    const msg = await sendSuggestionMessage(selected.id, { content: message });
    setMessage("");
    setSelected({ ...selected, messages: [ ...(selected.messages||[]), msg ] });
  };

  if(loading) return <Text>Loading...</Text>;
  if(role==="guest") return <Text>{i18n.t('suggestions.unauthorized')}</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.title}</Text>
        <FlatList data={selected.messages || []} keyExtractor={(x)=>String(x.id)}
          ListEmptyComponent={<Text>{i18n.t('suggestions.messagesNone')}</Text>}
          renderItem={({item})=> <Text>- {item.content}</Text>} />
        <TextInput placeholder={i18n.t('suggestions.messagePlaceholder')} value={message} onChangeText={setMessage} />
        <Button title={i18n.t('suggestions.send')} onPress={sendMsg} />
        <Button title={i18n.t('suggestions.back')} onPress={()=>{ setSelected(null); load(); }} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('suggestions.title')}</Text>
      <TextInput placeholder={i18n.t('suggestions.fieldTitle')} value={title} onChangeText={setTitle} />
      <TextInput placeholder={i18n.t('suggestions.fieldDescription')} value={description} onChangeText={setDescription} />
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder="Student ID" value={aboutStudentId} onChangeText={setAboutStudentId} />
      <Button title={i18n.t('suggestions.send')} onPress={submit} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text onPress={()=>openSuggestion(item)}>- {item.title}</Text>} />
    </View>
  );
}
