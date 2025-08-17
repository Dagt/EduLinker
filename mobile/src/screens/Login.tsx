
import { registerForPushNotificationsAsync } from "../notifications";
import { View, Text, TextInput, Button, Alert, Platform } from "react-native";
import { useState } from "react";
import { setToken, setRefreshToken } from "../api";
import { apiPostAuth } from "../api";
import i18n from "../i18n";

export default function Login({ onLoggedIn }: { onLoggedIn: ()=>void }){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function login(){
    if(!email){ Alert.alert(i18n.t('general.error'), i18n.t('login.missingEmail')); return; }
    if(!password){ Alert.alert(i18n.t('general.error'), i18n.t('login.missingPassword')); return; }
    const r = await fetch("http://10.0.2.2:8000/api/v1/auth/login/", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-School-ID":"1" },
      body: JSON.stringify({ username: email, password })
    });
    if(!r.ok){ Alert.alert(i18n.t('general.error'), i18n.t('login.invalid')); return; }
    const data = await r.json();
    await setToken(data.access);
    await setRefreshToken(data.refresh);
    const expoToken = await registerForPushNotificationsAsync();
    if (expoToken) {
      try {
        await apiPostAuth("/notifications/device-tokens/", { token: expoToken, platform: Platform.OS });
      } catch(e){}
    }
    onLoggedIn();
  }
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:20, marginBottom:8}}>{i18n.t('login.title')}</Text>
      <TextInput placeholder={i18n.t('login.email')} onChangeText={setEmail} style={{borderWidth:1, marginBottom:8, padding:8}}/>
      <TextInput placeholder={i18n.t('login.password')} secureTextEntry onChangeText={setPassword} style={{borderWidth:1, marginBottom:8, padding:8}}/>
      <Button title={i18n.t('login.signIn')} onPress={login}/>
    </View>
  );
}
