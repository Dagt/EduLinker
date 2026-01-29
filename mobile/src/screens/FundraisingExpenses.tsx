import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getFundraisingSummary, createExpenseEvidence, postActivityPhoto } from "../api";
import { pickAndUpload } from "../services/uploads";
import { getRole } from "../role";
import i18n from "../i18n";

export default function FundraisingExpenses(){
  const [items,setItems]=useState<any[]>([]);
  const [role,setRole]=useState("guest");
  const [eventId,setEventId]=useState("1");
  const [ledgerId,setLedgerId]=useState("");
  const [concept,setConcept]=useState("");
  const [amount,setAmount]=useState("");
  const [fileUrl,setFileUrl]=useState("");
  const [selected,setSelected]=useState<any|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try{
      const r = await getFundraisingSummary(Number(eventId));
      setItems(r.expenses || []);
    }catch{
      setItems([]);
      setError(true);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ (async()=>{ setRole(await getRole()); await load(); })(); },[]);

  const pick = async () => {
    try{
      const url = await pickAndUpload();
      if(!url) return;
      await postActivityPhoto({ photo_url: url });
      setFileUrl(url);
    }catch{
      Alert.alert(i18n.t("general.error"), i18n.t("uploads.uploadFailed"));
    }
  };

  const submit = async () => {
    await createExpenseEvidence({
      ledger: Number(ledgerId),
      file_url: fileUrl,
      amount,
      concept,
    });
    setLedgerId("");
    setConcept("");
    setAmount("");
    setFileUrl("");
    await load();
  };

  if(role!=="treasurer" && role!=="admin") return <Text>{i18n.t('general.unauthorized')}</Text>;
  if(loading) return <Text>{i18n.t("general.loading")}</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.concept}</Text>
        <Text>{i18n.t("fundraising.amount")}: {selected.amount}</Text>
        <Text>{i18n.t("fundraising.file")}: {selected.file_url}</Text>
        <Button title={i18n.t("general.back")} onPress={()=>setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t("fundraising.expensesTitle")}</Text>
      <TextInput placeholder={i18n.t("fundraising.eventId")} value={eventId} onChangeText={setEventId} />
      <TextInput placeholder={i18n.t("fundraising.ledgerId")} value={ledgerId} onChangeText={setLedgerId} />
      <TextInput placeholder={i18n.t("fundraising.concept")} value={concept} onChangeText={setConcept} />
      <TextInput placeholder={i18n.t("fundraising.amount")} value={amount} onChangeText={setAmount} />
      <Button title={i18n.t("uploads.pickPhoto")} onPress={pick} />
      {fileUrl ? <Text>{i18n.t("fundraising.file")}: {fileUrl}</Text> : null}
      <Button title={i18n.t("fundraising.add")} onPress={submit} />
      <FlatList data={items} keyExtractor={(_,i)=>String(i)}
        ListEmptyComponent={<Text>{i18n.t("general.noItems")}</Text>}
        renderItem={({item})=>(
          <Text onPress={()=>setSelected(item)}>- {item.concept}: {item.amount}</Text>
        )} />
    </View>
  );
}
