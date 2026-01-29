import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { apiGet } from "../api";
import { getRole } from "../role";
import EventPhotoUploader from "../components/EventPhotoUploader";
import i18n from "../i18n";

interface EventItem {
  id: number;
  title: string;
  start_at: string;
}

export default function EventCalendar() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [role, setRole] = useState("guest");

  useEffect(() => {
    (async () => {
      setRole(await getRole());
      const r = await apiGet("/events/");
      setEvents(r);
    })();
  }, []);

  async function remind(ev: EventItem) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          i18n.t("events.permissionTitle"),
          i18n.t("events.permissionMessage")
        );
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: { title: ev.title },
        trigger: new Date(ev.start_at),
      });
    } catch (e) {
      // ignore
    }
  }

  if (role === "guest") return <Text>{i18n.t("general.unauthorized")}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t("events.title")}</Text>
      <FlatList
        data={events}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ flex: 1 }}>
              - {item.title} ({item.start_at})
            </Text>
            <Button
              title={i18n.t("events.remind")}
              onPress={() => remind(item)}
              testID={`remind-${item.id}`}
            />
            <EventPhotoUploader eventId={item.id} />
          </View>
        )}
      />
    </View>
  );
}
