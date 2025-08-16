import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { getFundraisingSummary, createExpenseEvidence } from "../api";
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

  if(role!=="treasurer" && role!=="admin") return <Text>Unauthorized</Text>;
  if(loading) return <Text>Loading...</Text>;
  if(error) return <Text>{i18n.t('general.error')}</Text>;

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.concept}</Text>
        <Text>Amount: {selected.amount}</Text>
        <Text>File: {selected.file_url}</Text>
        <Button title="Back" onPress={()=>setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Fundraising Expenses</Text>
      <TextInput placeholder="Event ID" value={eventId} onChangeText={setEventId} />
      <TextInput placeholder="Ledger ID" value={ledgerId} onChangeText={setLedgerId} />
      <TextInput placeholder="Concept" value={concept} onChangeText={setConcept} />
      <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} />
      <TextInput placeholder="File URL" value={fileUrl} onChangeText={setFileUrl} />
      <Button title="Add" onPress={submit} />
      <FlatList data={items} keyExtractor={(_,i)=>String(i)}
        ListEmptyComponent={<Text>No items</Text>}
        renderItem={({item})=>(
          <Text onPress={()=>setSelected(item)}>- {item.concept}: {item.amount}</Text>
        )} />
    </View>
  );
}

