import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { apiGet, assignVocal, deactivateVocal } from '../../api';
import i18n from '../../i18n';

interface Props {
  groupId: number;
}

export default function VocalAssignments({ groupId }: Props){
  const [assignments,setAssignments]=useState<any[]>([]);
  const [parents,setParents]=useState<any[]>([]);
  const [selected,setSelected]=useState<number|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  const load=async()=>{
    setLoading(true); setError(false);
    try{
      const [ass,members]=await Promise.all([
        apiGet(`/groups/vocal-assignments/?group=${groupId}`),
        apiGet(`/groups/${groupId}/members/`),
      ]);
      setAssignments(ass||[]);
      setParents(members.parents||[]);
    }catch{
      setAssignments([]); setParents([]); setError(true);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[groupId]);

  const availableParents=parents.filter((p:any)=>!assignments.some((a:any)=>a.parent.id===p.id));

  const doAssign=async()=>{
    if(!selected) return;
    await assignVocal({ group: groupId, parent: selected });
    setSelected(null);
    await load();
  };

  const doDeactivate=async(id:number)=>{
    await deactivateVocal(id);
    await load();
  };

  if(loading) return <Text>{i18n.t('general.loading')}</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('vocalAssignments.title')}</Text>
      <FlatList data={assignments} keyExtractor={(a)=>String(a.id)}
        ListEmptyComponent={<Text>{i18n.t('vocalAssignments.none')}</Text>}
        renderItem={({item})=>(
          <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:4}}>
            <Text>{item.parent.first_name} {item.parent.last_name}</Text>
            <Button title={i18n.t('vocalAssignments.revoke')} onPress={()=>doDeactivate(item.id)} />
          </View>
        )}
      />
      {availableParents.length>0 && (
        <>
          <Text style={{marginTop:16}}>{i18n.t('vocalAssignments.selectParent')}</Text>
          <FlatList data={availableParents} horizontal keyExtractor={(p)=>String(p.id)} style={{maxHeight:40, marginBottom:8}}
            renderItem={({item})=>(
              <TouchableOpacity onPress={()=>setSelected(item.id)} style={{padding:8, marginRight:8, backgroundColor: selected===item.id?'#ddd':'#eee', borderRadius:4}}>
                <Text>{item.first_name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title={i18n.t('vocalAssignments.assign')} onPress={doAssign} />
        </>
      )}
    </View>
  );
}
