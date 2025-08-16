import { useState } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import GroupChat from "./src/screens/GroupChat";
import Complaints from "./src/screens/Complaints";
import Homeworks from "./src/screens/Homeworks";
import Surveys from "./src/screens/Surveys";
import EventCalendar from "./src/screens/EventCalendar";
import { View, Button } from "react-native";
import i18n from "./src/i18n";

export default function App(){
  const [logged,setLogged]=useState(false);
  const [view,setView]=useState<"feed"|"chat"|"complaints"|"homeworks"|"surveys"|"events">("feed");
  return (
    <View style={{flex:1}}>
      {logged ? (
        <>
          <View style={{flexDirection:"row", flexWrap:"wrap", gap:8, padding:8}}>
            <Button title={i18n.t('menu.feed')} onPress={()=>setView("feed")} />
            <Button title={i18n.t('menu.chat')} onPress={()=>setView("chat")} />
            <Button title={i18n.t('menu.complaints')} onPress={()=>setView("complaints")} />
            <Button title={i18n.t('menu.homeworks')} onPress={()=>setView("homeworks")} />
            <Button title={i18n.t('menu.surveys')} onPress={()=>setView("surveys")} />
            <Button title={i18n.t('menu.events')} onPress={()=>setView("events")} />
          </View>
          {view==="feed" ? <Feed/> :
           view==="chat" ? <GroupChat groupId={1}/> :
           view==="complaints" ? <Complaints/> :
           view==="homeworks" ? <Homeworks/> :
           view==="surveys" ? <Surveys/> :
           <EventCalendar/>}
        </>
      ) : <Login onLoggedIn={()=>setLogged(true)}/> }
    </View>
  );
}
