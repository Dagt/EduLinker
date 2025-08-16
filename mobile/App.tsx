import { useState } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import GroupChat from "./src/screens/GroupChat";
import Complaints from "./src/screens/Complaints";
import Homeworks from "./src/screens/Homeworks";
import Surveys from "./src/screens/Surveys";
import { View, Button } from "react-native";

export default function App(){
  const [logged,setLogged]=useState(false);
  const [view,setView]=useState<"feed"|"chat"|"complaints"|"homeworks"|"surveys">("feed");
  return (
    <View style={{flex:1}}>
      {logged ? (
        <>
          <View style={{flexDirection:"row", flexWrap:"wrap", gap:8, padding:8}}>
            <Button title="Feed" onPress={()=>setView("feed")} />
            <Button title="Chat" onPress={()=>setView("chat")} />
            <Button title="Quejas" onPress={()=>setView("complaints")} />
            <Button title="Tareas" onPress={()=>setView("homeworks")} />
            <Button title="Encuestas" onPress={()=>setView("surveys")} />
          </View>
          {view==="feed" ? <Feed/> :
           view==="chat" ? <GroupChat groupId={1}/> :
           view==="complaints" ? <Complaints/> :
           view==="homeworks" ? <Homeworks/> :
           <Surveys/>}
        </>
      ) : <Login onLoggedIn={()=>setLogged(true)}/> }
    </View>
  );
}
