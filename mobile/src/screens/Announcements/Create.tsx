import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from "react-native";
import { apiGet, createAnnouncement } from "../../api";
import { pickAndUpload } from "../../services/uploads";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function AnnouncementCreate(){
  const [role,setRole]=useState("guest");
  const [groups,setGroups]=useState<any[]>([]);
  const [groupId,setGroupId]=useState<number|null>(null);
  const [title,setTitle]=useState("");
  const [message,setMessage]=useState("");
  const [date,setDate]=useState("");
  const [attachments,setAttachments]=useState<string[]>([]);

  useEffect(()=>{(async()=>{
    const r=await getRole();
    setRole(r);
    if(r==="MAESTRO_TITULAR"||r==="MAESTRO_ITINERANTE"){
      try{
        const g=await apiGet("/groups/");
        setGroups(g);
        if(g.length) setGroupId(g[0].id);
      }catch{
        setGroups([]);
      }
    }
  })();},[]);

  if(role!=="MAESTRO_TITULAR"&&role!=="MAESTRO_ITINERANTE") return <Text>{i18n.t('general.unauthorized')}</Text>;

  const addAttachment=async()=>{
    try{
      const url=await pickAndUpload();
      if(url) setAttachments([...attachments,url]);
    }catch{
      Alert.alert(i18n.t('general.error'));
    }
  };

  const submit=async()=>{
    if(!title||!message||!date||!groupId){
      Alert.alert(i18n.t('general.error'));
      return;
    }
    await createAnnouncement({ title, message, group: groupId, scope:'GRUPO', publish_date: date, attachments });
    setTitle(""); setMessage(""); setDate(""); setAttachments([]);
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('announcementCreate.title')}</Text>
      <FlatList data={groups} horizontal keyExtractor={(g)=>String(g.id)} style={{maxHeight:40, marginBottom:8}}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=>setGroupId(item.id)} style={{padding:8, marginRight:8, backgroundColor: groupId===item.id ? '#ddd':'#eee', borderRadius:4}}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TextInput placeholder={i18n.t('announcementCreate.fieldTitle')} value={title} onChangeText={setTitle} />
      <TextInput placeholder={i18n.t('announcementCreate.fieldMessage')} value={message} onChangeText={setMessage} />
      <TextInput placeholder={i18n.t('announcementCreate.fieldDate')} value={date} onChangeText={setDate} />
      <Button title={i18n.t('announcementCreate.attach')} onPress={addAttachment} />
      <Button title={i18n.t('announcementCreate.submit')} onPress={submit} />
    </View>
  );
}
