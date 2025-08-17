import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert, TouchableOpacity } from "react-native";
import { apiGet, assignVocal, deactivateVocal } from "../../api";
import i18n from "../../i18n";

interface Group { id: number; name: string; }
interface Parent { id: number; first_name: string; last_name: string; role: string; vocal_assignment_id?: number; }

export default function VocalAssignments(){
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadGroups(){
    try{
      const data = await apiGet("/groups/");
      setGroups(data);
      if(data.length) setGroupId(data[0].id);
    }catch{
      setGroups([]);
    }
  }

  async function loadMembers(){
    if(!groupId) return;
    setLoading(true);
    setError(false);
    try{
      const data = await apiGet(`/groups/${groupId}/members/`);
      setParents(data.parents || []);
    }catch{
      setParents([]);
      setError(true);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ loadGroups(); },[]);
  useEffect(()=>{ loadMembers(); },[groupId]);

  const active = parents.filter(p=>p.role === "VOCAL");
  const available = parents.filter(p=>p.role !== "VOCAL");

  const assign = async (parentId: number) => {
    if(!groupId) return;
    try{
      await assignVocal(groupId, parentId);
      await loadMembers();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const deactivate = async (assignmentId?: number) => {
    if(!assignmentId) return;
    try{
      await deactivateVocal(assignmentId);
      await loadMembers();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('vocalAssignments.title')}</Text>
      <FlatList
        data={groups}
        horizontal
        keyExtractor={g=>String(g.id)}
        style={{maxHeight:40, marginBottom:8}}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={()=>setGroupId(item.id)}
            style={{padding:8, marginRight:8, backgroundColor: groupId===item.id?"#ddd":"#eee", borderRadius:4}}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {loading ? <Text>{i18n.t('general.loading')}</Text> : error ? <Text>{i18n.t('general.error')}</Text> : (
        <>
          <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('vocalAssignments.active')}</Text>
          <FlatList
            data={active}
            keyExtractor={p=>String(p.id)}
            ListEmptyComponent={<Text>{i18n.t('vocalAssignments.noneActive')}</Text>}
            renderItem={({item}) => (
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:4}}>
                <Text style={{flex:1}}>{item.first_name} {item.last_name}</Text>
                <Button title={i18n.t('vocalAssignments.revoke')} testID={`revoke-${item.vocal_assignment_id}`} onPress={()=>deactivate(item.vocal_assignment_id)} />
              </View>
            )}
          />
          <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('vocalAssignments.available')}</Text>
          <FlatList
            data={available}
            keyExtractor={p=>String(p.id)}
            ListEmptyComponent={<Text>{i18n.t('vocalAssignments.noneAvailable')}</Text>}
            renderItem={({item}) => (
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:4}}>
                <Text style={{flex:1}}>{item.first_name} {item.last_name}</Text>
                <Button title={i18n.t('vocalAssignments.assign')} testID={`assign-${item.id}`} onPress={()=>assign(item.id)} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

