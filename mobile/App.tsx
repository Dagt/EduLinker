import { useState } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import { View } from "react-native";

export default function App(){
  const [logged,setLogged]=useState(false);
  return <View style={{flex:1}}>{logged ? <Feed/> : <Login onLoggedIn={()=>setLogged(true)}/>}</View>;
}
