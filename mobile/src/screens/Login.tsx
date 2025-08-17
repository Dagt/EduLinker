
import { registerForPushNotificationsAsync } from "../notifications";
import { View, Text, TextInput, Button, Alert, Platform } from "react-native";
import { useState } from "react";
import { setToken, setRefreshToken, apiPost, apiPostAuth } from "../api";
import i18n from "../i18n";

export default function Login({ onLoggedIn }: { onLoggedIn: ()=>void }){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function login(){
    if(!email){ Alert.alert(i18n.t('general.error'), i18n.t('login.missingEmail')); return; }
    if(!password){ Alert.alert(i18n.t('general.error'), i18n.t('login.missingPassword')); return; }
    try{
      const data = await apiPost("/auth/login/", { username: email, password });
      await setToken(data.access);
      if(data.refresh) await setRefreshToken(data.refresh);
    } catch(e){
      Alert.alert(i18n.t('general.error'), i18n.t('login.invalid'));
      return;
    }
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
