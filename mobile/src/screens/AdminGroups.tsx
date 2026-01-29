import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { apiGet, apiPost } from "../api";
import i18n from "../i18n";

interface Group {
  id: number;
  name: string;
  grade_level: number;
}

export default function AdminGroups(){
  const [groups, setGroups] = useState<Group[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ name: "", grade_level: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try{
      const data = await apiGet("/groups/");
      setGroups(Array.isArray(data?.results) ? data.results : data);
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  const submitCreate = async () => {
    try{
      await apiPost("/groups/create/", {
        name: form.name,
        grade_level: Number(form.grade_level),
      });
      Alert.alert(i18n.t('adminGroups.created'));
      setForm({ name: "", grade_level: "" });
      await load();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const visible = groups.filter((g) => g.name?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('adminGroups.title')}</Text>
      <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('adminGroups.filterLabel')}</Text>
      <TextInput
        placeholder={i18n.t('adminGroups.filterPlaceholder')}
        value={filter}
        onChangeText={setFilter}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('adminGroups.createTitle')}</Text>
      <TextInput
        placeholder={i18n.t('adminGroups.name')}
        value={form.name}
        onChangeText={(value)=>setForm({ ...form, name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminGroups.grade')}
        value={form.grade_level}
        onChangeText={(value)=>setForm({ ...form, grade_level: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Button title={i18n.t('adminGroups.create')} onPress={submitCreate} />

      <Text style={{fontWeight:'600', marginTop:16}}>{i18n.t('adminGroups.listTitle')}</Text>
      {loading && <Text>{i18n.t('general.loading')}</Text>}
      <FlatList
        data={visible}
        keyExtractor={(item)=>String(item.id)}
        ListEmptyComponent={<Text>{i18n.t('general.noItems')}</Text>}
        renderItem={({item}) => (
          <View style={{paddingVertical:8, borderBottomWidth:1, borderColor:'#eee'}}>
            <Text>{item.name}</Text>
            <Text>{i18n.t('adminGroups.gradeLabel', { grade: item.grade_level })}</Text>
          </View>
        )}
      />
    </View>
  );
}
