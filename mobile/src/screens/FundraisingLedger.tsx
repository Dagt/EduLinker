import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { getFundraisingSummary, createFundraisingLedger } from "../api";
import { getRole } from "../role";
import i18n from "../i18n";

export default function FundraisingLedger(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [eventId,setEventId]=useState("1");
  const [groupId,setGroupId]=useState("");
  const [amount,setAmount]=useState("");
  const [selected,setSelected]=useState<any|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try{
      const r = await getFundraisingSummary(Number(eventId));
      setItems(r.ledgers || []);
    }catch{
      setItems([]);
      setError(true);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ (async()=>{ setRole(await getRole()); await load(); })(); },[]);

  const submit = async () => {
    await createFundraisingLedger({
      event: Number(eventId),
      group: Number(groupId),
      amount_collected: amount,
    });
    setGroupId("");
    setAmount("");
    await load();
  };

  if(role!=="treasurer" && role!=="admin") return <Text>Unauthorized</Text>;
  if(loading) return <Text>Loading...</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.group__name}</Text>
        <Text>Total: {selected.total}</Text>
        <Button title="Back" onPress={()=>setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Fundraising Ledger</Text>
      <TextInput placeholder="Event ID" value={eventId} onChangeText={setEventId} />
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} />
      <Button title="Add" onPress={submit} />
      <FlatList data={items} keyExtractor={(_,i)=>String(i)}
        ListEmptyComponent={<Text>No items</Text>}
        renderItem={({item})=> (
          <Text onPress={()=>setSelected(item)}>- {item.group__name}: {item.total}</Text>
        )} />
    </View>
  );
}

