import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Switch,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../notifications";
import { getRole } from "../role";
import { getNotificationPreferences, updateNotificationPreferences } from "../api";
import i18n from "../i18n";

export default function NotificationSettings() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("guest");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    push: true,
  });
  const [loading, setLoading] = useState(true);

  const PREFS_KEY = "notificationPrefs";

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => setRole(await getRole()))();
  }, []);

  useEffect(() => {
    if (role !== "guest") {
      setLoading(true);
      (async () => {
        const prefs = await getNotificationPreferences();
        setPrefs(prefs);
        await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
        setLoading(false);
      })();
    }
  }, [role]);

  if (role === "guest") return <Text>{i18n.t('general.unauthorized')}</Text>;

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

  const labels: Record<string, string> = {
    push: i18n.t('notificationSettings.push'),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title={i18n.t('notificationSettings.register')} onPress={register} />
      {token && <Text style={styles.token}>{token}</Text>}
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        Object.keys(prefs).map((key) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{labels[key] ?? key}</Text>
            <Switch
              testID={`${key}-switch`}
              value={prefs[key]}
              onValueChange={(v) => togglePref(key, v)}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  label: {
    flex: 1,
  },
  token: {
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
});

