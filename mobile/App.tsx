import { useState } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import GroupChat from "./src/screens/GroupChat";
import { View, Button } from "react-native";

export default function App(){
  const [logged,setLogged]=useState(false);
  const [view,setView]=useState<"feed"|"chat">("feed");
  return (
    <View style={{flex:1}}>
      {logged ? (
        <>
          <View style={{flexDirection:"row", gap:8, padding:8}}>
            <Button title="Feed" onPress={()=>setView("feed")} />
            <Button title="Chat" onPress={()=>setView("chat")} />
          </View>
          {view==="feed" ? <Feed/> : <GroupChat groupId={1}/>}
        </>
      ) : <Login onLoggedIn={()=>setLogged(true)}/> }
    </View>
  );
}
