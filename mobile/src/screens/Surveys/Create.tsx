import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from "react-native";
import { createSurvey, apiGet } from "../../api";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function SurveyCreate(){
  const [role,setRole]=useState("guest");
  const [groups,setGroups]=useState<any[]>([]);
  const [groupId,setGroupId]=useState<number|null>(null);
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [options,setOptions]=useState("");
  const [scope,setScope]=useState<'GRUPO'|'ESCUELA'>("GRUPO");
  const [anonymous,setAnonymous]=useState(false);
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");

  useEffect(()=>{(async()=>{
    const r=await getRole();
    setRole(r);
    if(["MAESTRO_TITULAR","MAESTRO_ITINERANTE","VOCAL","DIRECTOR"].includes(r)){
      try{
        const g=await apiGet("/groups/");
        setGroups(g);
        if(g.length) setGroupId(g[0].id);
      }catch{
        setGroups([]);
      }
    }
  })();},[]);

  if(!["MAESTRO_TITULAR","MAESTRO_ITINERANTE","VOCAL","DIRECTOR"].includes(role)) return <Text>{i18n.t('general.unauthorized')}</Text>;

  const submit=async()=>{
    const opts=options.split(',').map(o=>o.trim()).filter(Boolean);
    if(!title||!start||!end||!opts.length||(scope==='GRUPO'&&!groupId)){
      Alert.alert(i18n.t('general.error'));
      return;
    }
    const payload:any={ title, description, options:opts, scope, anonymous, start_at:start, end_at:end };
    if(scope==='GRUPO'&&groupId) payload.group=groupId;
    await createSurvey(payload);
    setTitle(""); setDescription(""); setOptions(""); setStart(""); setEnd("");
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('surveyCreate.title')}</Text>
      <View style={{flexDirection:'row', marginBottom:8}}>
        <Button title={i18n.t('surveyCreate.scopeSchool')} onPress={()=>setScope('ESCUELA')} />
        <Button title={i18n.t('surveyCreate.scopeGroup')} onPress={()=>setScope('GRUPO')} />
      </View>
      {scope==='GRUPO' && (
        <FlatList data={groups} horizontal keyExtractor={(g)=>String(g.id)} style={{maxHeight:40, marginBottom:8}}
          renderItem={({item})=>(
            <TouchableOpacity onPress={()=>setGroupId(item.id)} style={{padding:8, marginRight:8, backgroundColor: groupId===item.id ? '#ddd':'#eee', borderRadius:4}}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TextInput placeholder={i18n.t('surveyCreate.fieldTitle')} value={title} onChangeText={setTitle} />
      <TextInput placeholder={i18n.t('surveyCreate.fieldDescription')} value={description} onChangeText={setDescription} />
      <TextInput placeholder={i18n.t('surveyCreate.fieldOptions')} value={options} onChangeText={setOptions} />
      <TextInput placeholder={i18n.t('surveyCreate.fieldStart')} value={start} onChangeText={setStart} />
      <TextInput placeholder={i18n.t('surveyCreate.fieldEnd')} value={end} onChangeText={setEnd} />
      <Button title={`${i18n.t('surveyCreate.anonymous')}: ${anonymous ? 'Sí' : 'No'}`} onPress={()=>setAnonymous(!anonymous)} />
      <Button title={i18n.t('surveyCreate.submit')} onPress={submit} />
    </View>
  );
}

