import { useState, useEffect } from "react";
import Login from "./src/screens/Login";
import Feed from "./src/screens/Feed";
import GroupChat from "./src/screens/GroupChat";
import Complaints from "./src/screens/Complaints";
import Suggestions from "./src/screens/Suggestions";
import Homeworks from "./src/screens/Homeworks";
import HomeworkCreate from "./src/screens/Homeworks/Create";
import AnnouncementCreate from "./src/screens/Announcements/Create";
import Surveys from "./src/screens/Surveys";
import SurveyCreate from "./src/screens/Surveys/Create";
import EventCalendar from "./src/screens/EventCalendar";
import Fundraising from "./src/screens/Fundraising";
import VocalAssignments from "./src/screens/VocalAssignments";
import ProfileScreen from "./src/screens/ProfileScreen";
import EventAttendanceAnalytics from "./src/screens/EventAttendanceAnalytics";
import AdminUsers from "./src/screens/AdminUsers";
import AdminStudents from "./src/screens/AdminStudents";
import AdminGroups from "./src/screens/AdminGroups";
import AdminParentStudents from "./src/screens/AdminParentStudents";
import GroupDetail from "./src/screens/GroupDetail";
import ResetPassword from "./src/screens/ResetPassword";
import { View, Button } from "react-native";
import i18n from "./src/i18n";
import { getRole } from "./src/role";

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
  const [role,setRole]=useState("guest");
  const [view,setView]=useState<"feed"|"chat"|"complaints"|"suggestions"|"homeworks"|"createHomework"|"createAnnouncement"|"surveys"|"createSurvey"|"fundraising"|"events"|"vocalAssignments"|"profile"|"attendanceAnalytics"|"adminUsers"|"adminStudents"|"adminGroups"|"adminParentStudents"|"groupDetail"|"resetPassword">("feed");

  useEffect(()=>{ if(logged){ (async()=> setRole(await getRole()))(); } },[logged]);

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
            {(role==="MAESTRO_TITULAR"||role==="MAESTRO_ITINERANTE") && (
              <>
                <Button title={i18n.t('menu.createHomework')} onPress={()=>setView("createHomework")} />
                <Button title={i18n.t('menu.createAnnouncement')} onPress={()=>setView("createAnnouncement")} />
              </>
            )}
            <Button title={i18n.t('menu.surveys')} onPress={()=>setView("surveys")} />
            <Button title={i18n.t('menu.fundraising')} onPress={()=>setView("fundraising")} />
            <Button title={i18n.t('menu.events')} onPress={()=>setView("events")} />
            {(role==="MAESTRO_TITULAR"||role==="DIRECTOR"||role==="ADMIN_TENANT") && (
              <Button title={i18n.t('menu.vocalAssignments')} onPress={()=>setView("vocalAssignments")} />
            )}
            <Button title={i18n.t('menu.profile')} onPress={()=>setView("profile")} />
            {(role==="DIRECTOR"||role==="ADMIN_TENANT") && (
              <Button title={i18n.t('menu.attendanceAnalytics')} onPress={()=>setView("attendanceAnalytics")} />
            )}
            {(role==="DIRECTOR"||role==="ADMIN_TENANT") && (
              <>
                <Button title={i18n.t('menu.adminUsers')} onPress={()=>setView("adminUsers")} />
                <Button title={i18n.t('menu.adminStudents')} onPress={()=>setView("adminStudents")} />
                <Button title={i18n.t('menu.adminGroups')} onPress={()=>setView("adminGroups")} />
                <Button title={i18n.t('menu.adminParentStudents')} onPress={()=>setView("adminParentStudents")} />
                <Button title={i18n.t('menu.groupDetail')} onPress={()=>setView("groupDetail")} />
              </>
            )}
          </View>
          {view==="feed" ? <Feed/> :
           view==="chat" ? <GroupChat/> :
           view==="complaints" ? <Complaints/> :
           view==="suggestions" ? <Suggestions/> :
           view==="homeworks" ? <Homeworks/> :
           view==="createHomework" ? <HomeworkCreate/> :
           view==="createAnnouncement" ? <AnnouncementCreate/> :
           view==="surveys" ? <Surveys onCreate={()=>setView("createSurvey")} /> :
           view==="createSurvey" ? <SurveyCreate/> :
           view==="fundraising" ? <Fundraising/> :
           view==="vocalAssignments" ? <VocalAssignments/> :
           view==="profile" ? <ProfileScreen/> :
           view==="attendanceAnalytics" ? <EventAttendanceAnalytics/> :
           view==="adminUsers" ? <AdminUsers/> :
           view==="adminStudents" ? <AdminStudents/> :
           view==="adminGroups" ? <AdminGroups/> :
           view==="adminParentStudents" ? <AdminParentStudents/> :
           view==="groupDetail" ? <GroupDetail/> :
           <EventCalendar/>}
        </>
      ) : view==="resetPassword" ? <ResetPassword/> : <Login onLoggedIn={()=>setLogged(true)} onResetPassword={() => setView("resetPassword")} /> }
    </View>
  );
}
