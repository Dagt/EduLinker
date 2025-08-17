import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from "react-native";
import { apiGet, createHomework } from "../../api";
import { pickAndUpload } from "../../services/uploads";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function HomeworkCreate(){
  const [role,setRole]=useState("guest");
  const [groups,setGroups]=useState<any[]>([]);
  const [groupId,setGroupId]=useState<number|null>(null);
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [dueDate,setDueDate]=useState("");
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
    if(!title||!description||!dueDate||!groupId){
      Alert.alert(i18n.t('general.error'));
      return;
    }
    await createHomework({ title, description, due_date: dueDate, group: groupId, subject: '', attachments });
    setTitle(""); setDescription(""); setDueDate(""); setAttachments([]);
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('homeworkCreate.title')}</Text>
      <FlatList data={groups} horizontal keyExtractor={(g)=>String(g.id)} style={{maxHeight:40, marginBottom:8}}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=>setGroupId(item.id)} style={{padding:8, marginRight:8, backgroundColor: groupId===item.id ? '#ddd':'#eee', borderRadius:4}}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TextInput placeholder={i18n.t('homeworkCreate.fieldTitle')} value={title} onChangeText={setTitle} />
      <TextInput placeholder={i18n.t('homeworkCreate.fieldDescription')} value={description} onChangeText={setDescription} />
      <TextInput placeholder={i18n.t('homeworkCreate.fieldDueDate')} value={dueDate} onChangeText={setDueDate} />
      <Button title={i18n.t('homeworkCreate.attach')} onPress={addAttachment} />
      <Button title={i18n.t('homeworkCreate.submit')} onPress={submit} />
    </View>
  );
}
