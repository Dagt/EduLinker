import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Button, Alert } from "react-native";
import { apiGet, postActivityPhoto } from "../api";
import { pickAndUpload } from "../services/uploads";
import { getRole } from "../role";
import i18n from "../i18n";

export default function ActivityPhotos({ groupId, onBack }: { groupId: number; onBack?: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState("guest");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/groups/${groupId}/activity-photos/`);
        setItems(data);
      } catch {
        setItems([]);
      }
    })();
    (async () => {
      setRole(await getRole());
    })();
  }, [groupId]);

  const upload = async () => {
    try {
      const url = await pickAndUpload();
      if (!url) return;
      await postActivityPhoto({ group: groupId, photo_url: url });
      setItems((prev) => [...prev, { id: Date.now(), photo_url: url }]);
    } catch {
      Alert.alert(i18n.t("general.error"), i18n.t("general.error"));
    }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      {onBack && <Button title={i18n.t("suggestions.back")} onPress={onBack} />}
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t("activityPhotos.title")}</Text>
      {["MAESTRO_TITULAR", "MAESTRO_ITINERANTE", "VOCAL"].includes(role) && (
        <Button title={i18n.t("activityPhotos.upload")} onPress={upload} />
      )}
      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>{i18n.t("activityPhotos.empty")}</Text>}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.photo_url }}
            style={{ width: "100%", height: 200, marginBottom: 8 }}
          />
        )}
      />
    </View>
  );
}
