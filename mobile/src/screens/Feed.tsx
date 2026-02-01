import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { apiGet } from "../api";
import i18n from "../i18n";

export default function Feed() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data: any = await apiGet("/feed/");
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems(data?.results || []);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t("feed.title")}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "600" }}>{item.title || item.subject || "--"}</Text>
            <Text>{item.message || item.description || "--"}</Text>
          </View>
        )}
      />
    </View>
  );
}
