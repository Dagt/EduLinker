import { useEffect, useState } from "react";
import { View, Text, Button, Switch } from "react-native";
import { registerForPushNotificationsAsync } from "../notifications";
import { getRole } from "../role";
import { getNotificationChannels, updateNotificationChannels } from "../api";

export default function NotificationSettings() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("guest");
  const [channels, setChannels] = useState({ push: true, email: true });

  useEffect(() => {
    (async () => setRole(await getRole()))();
  }, []);

  useEffect(() => {
    (async () => {
      if (role !== "guest") {
        const prefs = await getNotificationChannels();
        setChannels(prefs);
      }
    })();
  }, [role]);

  if (role === "guest") return <Text>No autorizado</Text>;

  async function register() {
    const tk = await registerForPushNotificationsAsync();
    setToken(tk);
  }

  async function toggleChannel(key: "push" | "email", value: boolean) {
    const newPrefs = { ...channels, [key]: value };
    setChannels(newPrefs);
    await updateNotificationChannels(newPrefs);
  }

  return (
    <View style={{ padding: 16 }}>
      <Button title="Registrar" onPress={register} />
      {token && <Text>{token}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
        <Text>Push</Text>
        <Switch
          testID="push-switch"
          value={channels.push}
          onValueChange={(v) => toggleChannel("push", v)}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
        <Text>Email</Text>
        <Switch
          testID="email-switch"
          value={channels.email}
          onValueChange={(v) => toggleChannel("email", v)}
        />
      </View>
    </View>
  );
}

