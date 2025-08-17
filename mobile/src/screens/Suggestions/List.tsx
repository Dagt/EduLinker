import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getSuggestions, createSuggestion } from "../../api";
import { getRole } from "../../role";
import i18n from "../../i18n";

export default function SuggestionsList({ onSelect, refresh }: { onSelect: (item: any) => void; refresh: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [aboutStudentId, setAboutStudentId] = useState("");

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await getSuggestions();
      setItems(r);
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => { setRole(await getRole()); await load(); })(); }, [refresh]);

  const submit = async () => {
    if (!title || !description || !groupId || !teacherId) {
      Alert.alert(i18n.t('general.error'), i18n.t('suggestions.title'));
      return;
    }
    const created = await createSuggestion({
      title,
      description,
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      ...(aboutStudentId ? { about_student_id: Number(aboutStudentId) } : {}),
    });
    setItems([...items, created]);
    setTitle("");
    setDescription("");
    setGroupId("");
    setTeacherId("");
    setAboutStudentId("");
  };

  if (loading) return <Text>{i18n.t('general.loading')}</Text>;
  if (role === "guest") return <Text>{i18n.t('suggestions.unauthorized')}</Text>;
  if (error) return <Text>{i18n.t('general.error')}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t('suggestions.title')}</Text>
      <TextInput placeholder={i18n.t('suggestions.fieldTitle')} value={title} onChangeText={setTitle} />
      <TextInput placeholder={i18n.t('suggestions.fieldDescription')} value={description} onChangeText={setDescription} />
      <TextInput placeholder={i18n.t('suggestions.groupId')} value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder={i18n.t('suggestions.teacherId')} value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder={i18n.t('suggestions.studentId')} value={aboutStudentId} onChangeText={setAboutStudentId} />
      <Button title={i18n.t('suggestions.send')} onPress={submit} />
      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <Text onPress={() => onSelect(item)}>- {item.title}</Text>
        )}
      />
    </View>
  );
}

