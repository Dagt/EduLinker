import { useState } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import GroupChat from "./src/screens/GroupChat";
import Complaints from "./src/screens/Complaints";
import Suggestions from "./src/screens/Suggestions";
import Homeworks from "./src/screens/Homeworks";
import Surveys from "./src/screens/Surveys";
import SurveyCreate from "./src/screens/Surveys/Create";
import EventCalendar from "./src/screens/EventCalendar";
import Fundraising from "./src/screens/Fundraising";
import { View, Button } from "react-native";
import i18n from "./src/i18n";

if (process.env.NODE_ENV !== "test") {
  const Sentry = require("sentry-expo");
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: false,
  });
}

export default function App(){
  const [logged,setLogged]=useState(false);
  const [view,setView]=useState<
    | "feed"
    | "chat"
    | "complaints"
    | "suggestions"
    | "homeworks"
    | "surveys"
    | "surveys-create"
    | "fundraising"
    | "events"
  >("feed");
  return (
    <View style={{flex:1}}>
      {logged ? (
        <>
          <View style={{flexDirection:"row", flexWrap:"wrap", gap:8, padding:8}}>
            <Button title={i18n.t('menu.feed')} onPress={()=>setView("feed")} />
            <Button title={i18n.t('menu.chat')} onPress={()=>setView("chat")} />
            <Button title={i18n.t('menu.complaints')} onPress={()=>setView("complaints")} />
            <Button title={i18n.t('menu.suggestions')} onPress={()=>setView("suggestions")} />
            <Button title={i18n.t('menu.homeworks')} onPress={()=>setView("homeworks")} />
            <Button title={i18n.t('menu.surveys')} onPress={()=>setView("surveys")} />
            <Button title={i18n.t('menu.fundraising')} onPress={()=>setView("fundraising")} />
            <Button title={i18n.t('menu.events')} onPress={()=>setView("events")} />
          </View>
          {view==="feed" ? <Feed/> :
           view==="chat" ? <GroupChat/> :
           view==="complaints" ? <Complaints/> :
           view==="suggestions" ? <Suggestions/> :
           view==="homeworks" ? <Homeworks/> :
           view==="surveys" ? <Surveys onCreate={()=>setView("surveys-create")} /> :
           view==="surveys-create" ? <SurveyCreate onBack={()=>setView("surveys")} /> :
           view==="fundraising" ? <Fundraising/> :
           <EventCalendar/>}
        </>
      ) : <Login onLoggedIn={()=>setLogged(true)}/> }
    </View>
  );
}
