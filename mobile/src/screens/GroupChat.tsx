import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiGet, apiPost, uploadFile } from "../api";

interface Group {
  id: number;
  name: string;
}

export default function GroupChat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  async function loadMessages() {
    if (!groupId) return;
    try {
      const data = await apiGet(`/chats/${groupId}/messages/`);
      setMsgs(data);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo cargar");
    }
  }

  async function loadGroups() {
    try {
      const data = await apiGet("/groups/");
      setGroups(data);
      if (data.length) setGroupId(data[0].id);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudieron cargar los grupos");
    }
  }

  async function pickAttachment() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({});
      if (result.canceled) return;
      const asset = result.assets[0];
      setAttachmentPreview(asset.uri);
      const url = await uploadFile(
        asset.uri,
        asset.mimeType || "application/octet-stream"
      );
      setAttachment(url);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo adjuntar");
    }
  }

  async function send() {
    if (!groupId) return;
    try {
      await apiPost(`/chats/${groupId}/messages/`, {
        message_text: text,
        attachment_url: attachment,
      });
      setText("");
      setAttachment(null);
      setAttachmentPreview(null);
      loadMessages();
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo enviar");
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  const roleColors: Record<string, string> = {
    PADRE: "#3498db",
    MAESTRO_TITULAR: "#2ecc71",
    ADMIN: "#e74c3c",
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Chat Grupo</Text>
      <FlatList
        data={groups}
        horizontal
        keyExtractor={(g) => String(g.id)}
        style={{ maxHeight: 40, marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setGroupId(item.id)}
            style={{
              padding: 8,
              marginRight: 8,
              backgroundColor: groupId === item.id ? "#ddd" : "#eee",
              borderRadius: 4,
            }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        style={{ flex: 1 }}
        data={msgs}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontWeight: "600" }}>{item.author_display}</Text>
              {item.author_role && (
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                    color: "#fff",
                    backgroundColor: roleColors[item.author_role] || "#7f8c8d",
                  }}
                >
                  {item.author_role}
                </Text>
              )}
            </View>
            {item.attachment_url ? (
              <Image
                source={{ uri: item.attachment_url }}
                style={{ width: 200, height: 200, marginBottom: 4 }}
              />
            ) : null}
            {item.message_text ? <Text>{item.message_text}</Text> : null}
          </View>
        )}
      />
      {attachmentPreview && (
        <Image
          source={{ uri: attachmentPreview }}
          style={{ width: 80, height: 80, marginBottom: 8 }}
        />
      )}
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Button title="Adjuntar" onPress={pickAttachment} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje"
          style={{ flex: 1, borderWidth: 1, padding: 8 }}
        />
        <Button title="Enviar" onPress={send} />
      </View>
    </View>
  );
}

