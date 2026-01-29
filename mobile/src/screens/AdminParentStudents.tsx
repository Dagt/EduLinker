import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { listParentStudents, createParentStudent, deleteParentStudent, listUsers, listStudents } from "../api";
import i18n from "../i18n";

interface ParentStudent {
  id: number;
  parent: number;
  student: number;
  relationship: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  enrollment_code: string;
}

export default function AdminParentStudents(){
  const [relations, setRelations] = useState<ParentStudent[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [loading, setLoading] = useState(false);

  const parentMap = useMemo(() => new Map(parents.map((p) => [p.id, p])), [parents]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  const load = async () => {
    setLoading(true);
    try {
      const [relationsRes, parentsRes, studentsRes] = await Promise.all([
        listParentStudents(),
        listUsers({ role: "PADRE" }),
        listStudents(),
      ]);
      setRelations(Array.isArray(relationsRes?.results) ? relationsRes.results : relationsRes);
      setParents(Array.isArray(parentsRes?.results) ? parentsRes.results : parentsRes);
      setStudents(Array.isArray(studentsRes?.results) ? studentsRes.results : studentsRes);
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!parentId || !studentId || !relationship) {
      Alert.alert(i18n.t('general.error'), i18n.t('adminParentStudents.missing'));
      return;
    }
    try {
      await createParentStudent({ parent: Number(parentId), student: Number(studentId), relationship });
      setParentId("");
      setStudentId("");
      setRelationship("");
      Alert.alert(i18n.t('adminParentStudents.created'));
      await load();
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteParentStudent(id);
      await load();
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t('adminParentStudents.title')}</Text>
      <Text style={{ fontWeight: '600' }}>{i18n.t('adminParentStudents.createTitle')}</Text>
      <TextInput
        placeholder={i18n.t('adminParentStudents.parentId')}
        value={parentId}
        onChangeText={setParentId}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder={i18n.t('adminParentStudents.studentId')}
        value={studentId}
        onChangeText={setStudentId}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder={i18n.t('adminParentStudents.relationship')}
        value={relationship}
        onChangeText={setRelationship}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title={i18n.t('adminParentStudents.create')} onPress={submit} />

      <Text style={{ fontWeight: '600', marginTop: 16 }}>{i18n.t('adminParentStudents.listTitle')}</Text>
      {loading && <Text>{i18n.t('general.loading')}</Text>}
      <FlatList
        data={relations}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text>{i18n.t('general.noItems')}</Text>}
        renderItem={({ item }) => {
          const parent = parentMap.get(item.parent);
          const student = studentMap.get(item.student);
          return (
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text>{i18n.t('adminParentStudents.parentLabel', { name: parent ? `${parent.first_name} ${parent.last_name}` : item.parent })}</Text>
              <Text>{i18n.t('adminParentStudents.studentLabel', { name: student ? `${student.first_name} ${student.last_name}` : item.student })}</Text>
              <Text>{i18n.t('adminParentStudents.relationshipLabel', { relationship: item.relationship })}</Text>
              <Button title={i18n.t('adminParentStudents.delete')} onPress={() => remove(item.id)} />
            </View>
          );
        }}
      />
    </View>
  );
}
