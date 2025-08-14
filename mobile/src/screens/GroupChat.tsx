import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { apiGet, apiPost } from "../api";

export default function GroupChat({ groupId = 1 }: { groupId?: number }){
  const [msgs,setMsgs]=useState<any[]>([]);
  const [text,setText]=useState("");

  async function load(){
    try{
      const data = await apiGet(`/chats/${groupId}/messages/`);
      setMsgs(data);
    }catch(e:any){ Alert.alert("Error", e.message || "No se pudo cargar"); }
  }

  async function send(){
    try{
      await apiPost(`/chats/${groupId}/messages/`, { message_text: text, attachment_url: null });
      setText(""); load();
    }catch(e:any){ Alert.alert("Error", e.message || "No se pudo enviar"); }
  }

  useEffect(()=>{ load(); },[groupId]);

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={{fontSize:18, marginBottom:8}}>Chat Grupo {groupId}</Text>
      <FlatList
        style={{flex:1}}
        data={msgs}
        keyExtractor={(x)=>String(x.id)}
        renderItem={({item})=>(
          <View style={{marginBottom:8}}>
            <Text style={{fontWeight:"600"}}>{item.author_display} {item.author_role ? `(${item.author_role})` : ""}</Text>
            <Text>{item.message_text}</Text>
          </View>
        )}
      />
      <View style={{flexDirection:"row", gap:8}}>
        <TextInput value={text} onChangeText={setText} placeholder="Escribe un mensaje"
          style={{flex:1, borderWidth:1, padding:8}} />
        <Button title="Enviar" onPress={send}/>
      </View>
    </View>
  );
}
