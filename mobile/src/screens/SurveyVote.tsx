import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { apiPost } from "../api";
import { getRole } from "../role";

export default function SurveyVote(){
  const [id,setId]=useState("");
  const [choice,setChoice]=useState("");
  const [msg,setMsg]=useState("");
  const [role,setRole]=useState("guest");

  (async()=>setRole(await getRole()))();
  if(role==="guest") return <Text>No autorizado</Text>;

  async function submit(){
    try{
      await apiPost(`/surveys/${id}/vote`, { choiceId: Number(choice) });
      setMsg("Voto registrado"); setId(""); setChoice("");
    }catch(err:any){ setMsg(err.message || "Error"); }
  }

  return (
    <View style={{padding:16}}>
      <Text>ID Encuesta</Text>
      <TextInput value={id} onChangeText={setId} style={{borderWidth:1, marginBottom:8}}/>
      <Text>ID Opción</Text>
      <TextInput value={choice} onChangeText={setChoice} style={{borderWidth:1, marginBottom:8}}/>
      <Button title="Votar" onPress={submit}/>
      {msg? <Text>{msg}</Text>: null}
    </View>
  );
}
