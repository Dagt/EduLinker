import { useEffect, useState } from "react";
import { View, Text, Button, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../notifications";
import { getRole } from "../role";
import { getNotificationPreferences, updateNotificationPreferences } from "../api";

export default function NotificationSettings() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("guest");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ push: true, email: true });

  const PREFS_KEY = "notificationPrefs";

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    })();
  }, []);

  useEffect(() => {
    (async () => setRole(await getRole()))();
  }, []);

  useEffect(() => {
    (async () => {
      if (role !== "guest") {
        const prefs = await getNotificationPreferences();
        setPrefs(prefs);
        await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      }
    })();
  }, [role]);

  if (role === "guest") return <Text>No autorizado</Text>;

  async function register() {
    const tk = await registerForPushNotificationsAsync();
    setToken(tk);
  }

  async function togglePref(key: string, value: boolean) {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    await updateNotificationPreferences(newPrefs);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  }

  return (
    <View style={{ padding: 16 }}>
      <Button title="Registrar" onPress={register} />
      {token && <Text>{token}</Text>}
      {Object.keys(prefs).map((key) => (
        <View
          key={key}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}
        >
          <Text>{key}</Text>
          <Switch
            testID={`${key}-switch`}
            value={prefs[key]}
            onValueChange={(v) => togglePref(key, v)}
          />
        </View>
      ))}
    </View>
  );
}

