import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getComplaints, createComplaint } from "../../api";
import i18n from "../../i18n";

export default function ComplaintsList({ onSelect, refresh }: { onSelect: (item: any) => void; refresh: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [aboutStudentId, setAboutStudentId] = useState("");

  const load = async () => {
    try {
      const data = await getComplaints();
      setItems(data);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [refresh]);

  const submit = async () => {
    if (!content || !groupId || !teacherId) {
      Alert.alert(i18n.t('general.error'), i18n.t('complaints.requiredComplaint'));
      return;
    }
    await createComplaint({
      content,
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      ...(aboutStudentId ? { about_student_id: Number(aboutStudentId) } : {}),
    });
    setContent("");
    setGroupId("");
    setTeacherId("");
    setAboutStudentId("");
    await load();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t('complaints.title')}</Text>
      <TextInput placeholder={i18n.t('complaints.groupId')} value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder={i18n.t('complaints.teacherId')} value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder={i18n.t('complaints.placeholder')} value={content} onChangeText={setContent} />
      <TextInput placeholder={i18n.t('complaints.studentId')} value={aboutStudentId} onChangeText={setAboutStudentId} />
      <Button title={i18n.t('complaints.send')} onPress={submit} />
      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        ListEmptyComponent={<Text>{i18n.t('complaints.none')}</Text>}
        renderItem={({ item }) => (
          <Text onPress={() => onSelect(item)}>- {item.title || item.content}</Text>
        )}
      />
    </View>
  );
}
