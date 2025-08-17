import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getComplaintMessages, sendComplaintMessage, updateComplaint, deleteComplaint, escalateComplaint } from "../../api";
import i18n from "../../i18n";

export default function ComplaintDetail({ complaint, onBack }: { complaint: any; onBack: () => void }) {
  const [data, setData] = useState<any>(complaint);
  const [message, setMessage] = useState("");
  const [content, setContent] = useState(complaint.content || "");

  useEffect(() => {
    (async () => {
      try {
        const msgs = await getComplaintMessages(complaint.id);
        setData({ ...complaint, messages: msgs });
      } catch {
        setData({ ...complaint, messages: [] });
      }
    })();
  }, [complaint]);

  const sendMsg = async () => {
    if (!message) {
      Alert.alert(i18n.t('general.error'), i18n.t('complaints.requiredMessage'));
      return;
    }
    const msg = await sendComplaintMessage(complaint.id, { content: message });
    setMessage("");
    setData({ ...data, messages: [ ...(data.messages || []), msg ] });
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        style={{ fontSize: 18, marginBottom: 8 }}
        value={content}
        onChangeText={setContent}
      />
      <Button title={i18n.t('complaints.save')} onPress={async () => {
        await updateComplaint(data.id, { content });
        setData({ ...data, content });
      }} />
      <FlatList
        data={data.messages || []}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>{i18n.t('complaints.messagesNone')}</Text>}
        renderItem={({ item }) => <Text>- {item.content}</Text>}
      />
      <TextInput
        placeholder={i18n.t('complaints.messagePlaceholder')}
        value={message}
        onChangeText={setMessage}
      />
      <Button title={i18n.t('complaints.send')} onPress={sendMsg} />
      <Button title={i18n.t('complaints.back')} onPress={onBack} />
      <Button title={i18n.t('complaints.escalate')} onPress={async () => { await escalateComplaint(data.id); }} />
      <Button title={i18n.t('complaints.delete')} onPress={async () => { await deleteComplaint(data.id); onBack(); }} />
    </View>
  );
}

