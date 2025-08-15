import { useState } from "react";
import { View, Text, Button } from "react-native";
import { registerForPushNotificationsAsync } from "../notifications";
import { getRole } from "../role";

export default function NotificationSettings(){
  const [token,setToken]=useState<string|null>(null);
  const [role,setRole]=useState("guest");
  (async()=>setRole(await getRole()))();
  if(role==="guest") return <Text>No autorizado</Text>;

  async function register(){
    const tk = await registerForPushNotificationsAsync();
    setToken(tk);
  }

  return (
    <View style={{padding:16}}>
      <Button title="Registrar" onPress={register}/>
      {token && <Text>{token}</Text>}
    </View>
  );
}
