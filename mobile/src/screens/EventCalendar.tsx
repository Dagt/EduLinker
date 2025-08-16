import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { apiGet, postEventPhoto, uploadFile } from "../api";
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
      const r = await apiGet("/events/");
      setEvents(r);
    })();
  }, []);

  async function remind(ev: EventItem) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Activa las notificaciones para recibir recordatorios"
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

  async function addPhoto(ev: EventItem) {
    try {
      const img = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (img.canceled) return;
      const uri = img.assets[0].uri;
      const url = await uploadFile(uri, "image/jpeg");
      await postEventPhoto(ev.id, { url });
    } catch (e) {
      Alert.alert("Error", "No se pudo subir la imagen");
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
            <Button title="Recordar" onPress={() => remind(item)} testID={`remind-${item.id}`} />
            <Button title="Subir Foto" onPress={() => addPhoto(item)} testID={`photo-${item.id}`} />
          </View>
        )}
      />
    </View>
  );
}

