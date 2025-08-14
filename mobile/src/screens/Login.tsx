import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { setToken } from "../api";

export default function Login({ onLoggedIn }: { onLoggedIn: ()=>void }){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function login(){
    const r = await fetch("http://10.0.2.2:8000/api/v1/auth/login/", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-School-ID":"1" },
      body: JSON.stringify({ username: email, password })
    });
    if(!r.ok){ Alert.alert("Error","Credenciales inválidas"); return; }
    const data = await r.json();
    await setToken(data.access);
    onLoggedIn();
  }
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:20, marginBottom:8}}>EduLinker</Text>
      <TextInput placeholder="Email" onChangeText={setEmail} style={{borderWidth:1, marginBottom:8, padding:8}}/>
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={{borderWidth:1, marginBottom:8, padding:8}}/>
      <Button title="Entrar" onPress={login}/>
    </View>
  );
}
