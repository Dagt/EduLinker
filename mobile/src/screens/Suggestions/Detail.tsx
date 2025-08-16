import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { getSuggestionMessages, sendSuggestionMessage, updateSuggestion, deleteSuggestion } from "../../api";
import i18n from "../../i18n";

export default function SuggestionDetail({ suggestion, onBack }: { suggestion: any; onBack: () => void }) {
  const [data, setData] = useState<any>(suggestion);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState(suggestion.title || "");
  const [description, setDescription] = useState(suggestion.description || "");

  useEffect(() => {
    (async () => {
      try {
        const msgs = await getSuggestionMessages(suggestion.id);
        setData({ ...suggestion, messages: msgs });
      } catch {
        setData({ ...suggestion, messages: [] });
      }
    })();
  }, [suggestion]);

  const sendMsg = async () => {
    const msg = await sendSuggestionMessage(suggestion.id, { content: message });
    setMessage("");
    setData({ ...data, messages: [ ...(data.messages || []), msg ] });
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        style={{ fontSize: 18, marginBottom: 8 }}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={{ marginBottom: 8 }}
        value={description}
        onChangeText={setDescription}
      />
      <Button title={i18n.t('suggestions.save')} onPress={async () => {
        await updateSuggestion(data.id, { title, description });
        setData({ ...data, title, description });
      }} />
      <FlatList
        data={data.messages || []}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>{i18n.t('suggestions.messagesNone')}</Text>}
        renderItem={({ item }) => <Text>- {item.content}</Text>}
      />
      <TextInput
        placeholder={i18n.t('suggestions.messagePlaceholder')}
        value={message}
        onChangeText={setMessage}
      />
      <Button title={i18n.t('suggestions.send')} onPress={sendMsg} />
      <Button title={i18n.t('suggestions.back')} onPress={onBack} />
      <Button title={i18n.t('suggestions.delete')} onPress={async () => { await deleteSuggestion(data.id); onBack(); }} />
    </View>
  );
}

