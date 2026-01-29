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

  if(role!=="treasurer" && role!=="admin") return <Text>{i18n.t('general.unauthorized')}</Text>;
  if(loading) return <Text>{i18n.t('general.loading')}</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.group__name}</Text>
        <Text>{i18n.t("fundraising.total")}: {selected.total}</Text>
        <Button title={i18n.t("general.back")} onPress={()=>setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t("fundraising.ledgerTitle")}</Text>
      <TextInput placeholder={i18n.t("fundraising.eventId")} value={eventId} onChangeText={setEventId} />
      <TextInput placeholder={i18n.t("fundraising.groupId")} value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder={i18n.t("fundraising.amount")} value={amount} onChangeText={setAmount} />
      <Button title={i18n.t("fundraising.add")} onPress={submit} />
      <FlatList data={items} keyExtractor={(_,i)=>String(i)}
        ListEmptyComponent={<Text>{i18n.t("general.noItems")}</Text>}
        renderItem={({item})=> (
          <Text onPress={()=>setSelected(item)}>- {item.group__name}: {item.total}</Text>
        )} />
    </View>
  );
}
