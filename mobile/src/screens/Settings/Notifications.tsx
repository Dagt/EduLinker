import { useEffect, useState } from "react";
import { View, Text, Switch } from "react-native";
import { apiGet, apiPostAuth, apiPutAuth } from "../../api";
import i18n from "../../i18n";

interface Pref { id?: number; enabled: boolean }

const CHANNELS = [
  { kind: "event", label: i18n.t("notificationSettings.event") },
  { kind: "survey", label: i18n.t("notificationSettings.survey") },
  { kind: "complaint", label: i18n.t("notificationSettings.complaint") },
  { kind: "complaint_message", label: i18n.t("notificationSettings.complaintMessage") },
];

export default function Notifications(){
  const [prefs, setPrefs] = useState<Record<string, Pref>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/notifications/prefs/");
        const map: Record<string, Pref> = {};
        for (const p of data) map[p.kind] = { id: p.id, enabled: p.enabled };
        setPrefs(map);
      } catch(e){}
    })();
  }, []);

  async function toggle(kind: string, value: boolean){
    setPrefs(prev => ({ ...prev, [kind]: { ...prev[kind], enabled: value } }));
    const pref = prefs[kind];
    try {
      if(pref && pref.id){
        await apiPutAuth(`/notifications/prefs/${pref.id}/`, { kind, enabled: value });
      } else {
        const res = await apiPostAuth("/notifications/prefs/", { kind, enabled: value });
        setPrefs(prev => ({ ...prev, [kind]: { id: res.id, enabled: res.enabled } }));
      }
    } catch(e){}
  }

  return (
    <View style={{ padding:16 }}>
      {CHANNELS.map(c => (
        <View key={c.kind} style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
          <Text style={{ flex:1 }}>{c.label}</Text>
          <Switch value={prefs[c.kind]?.enabled ?? true} onValueChange={v => toggle(c.kind, v)} />
        </View>
      ))}
    </View>
  );
}
