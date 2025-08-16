import { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import * as Notifications from "expo-notifications";
import { getEvents } from "../api";
import { getRole } from "../role";

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
      try {
        const r = await getEvents();
        setEvents(r);
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  async function remind(ev: EventItem) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      await Notifications.scheduleNotificationAsync({
        content: { title: ev.title },
        trigger: new Date(ev.start_at),
      });
    } catch (e) {
      // ignore
    }
  }

  if (role === "guest") return <Text>No autorizado</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Calendario</Text>
      <FlatList
        data={events}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ flex: 1 }}>
              - {item.title} ({item.start_at})
            </Text>
            <Button
              title="Recordar"
              onPress={() => remind(item)}
              testID={`remind-${item.id}`}
            />
          </View>
        )}
      />
    </View>
  );
}

