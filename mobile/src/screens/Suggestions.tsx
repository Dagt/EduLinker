import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { apiGet, createSuggestion, sendSuggestionMessage } from "../api";
import { getRole } from "../role";
import i18n from "../i18n";

export default function Suggestions(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    try{
      const r = await apiGet("/suggestions/");
      setItems(r);
    }catch{
      setItems([]);
    }
  };

  useEffect(()=>{ (async()=>{ setRole(await getRole()); await load(); })(); },[]);

  const submit = async () => {
    const created = await createSuggestion({ title, description });
    setItems([...items, created]);
    setTitle("");
    setDescription("");
  };

  const openSuggestion = async (s: any) => {
    setSelected(s);
    try{
      const msgs = await apiGet(`/suggestions/${s.id}/messages/`);
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

  if(role==="guest") return <Text>{i18n.t('suggestions.unauthorized')}</Text>;

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
      <Button title={i18n.t('suggestions.send')} onPress={submit} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=><Text onPress={()=>openSuggestion(item)}>- {item.title}</Text>} />
    </View>
  );
}
