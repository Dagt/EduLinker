import { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert } from "react-native";
import {
  getGroup,
  listGroupMembers,
  listGroupVocals,
  assignHomeroom,
  assignSpecialist,
  assignVocal,
  deactivateVocal,
} from "../api";
import i18n from "../i18n";

export default function GroupDetail(){
  const [groupId, setGroupId] = useState("");
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any>(null);
  const [vocals, setVocals] = useState<any[]>([]);
  const [homeroomId, setHomeroomId] = useState("");
  const [specialistId, setSpecialistId] = useState("");
  const [specialistSubject, setSpecialistSubject] = useState("");
  const [vocalParentId, setVocalParentId] = useState("");

  const load = async () => {
    if (!groupId) return;
    try {
      const id = Number(groupId);
      const [groupRes, membersRes, vocalsRes] = await Promise.all([
        getGroup(id),
        listGroupMembers(id),
        listGroupVocals(id),
      ]);
      setGroup(groupRes);
      setMembers(membersRes);
      setVocals(Array.isArray(vocalsRes?.results) ? vocalsRes.results : vocalsRes);
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const assignHomeroomTeacher = async () => {
    if (!groupId || !homeroomId) return;
    try {
      await assignHomeroom(Number(groupId), Number(homeroomId));
      Alert.alert(i18n.t('groupDetail.homeroomAssigned'));
      setHomeroomId("");
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const assignSpecialistTeacher = async () => {
    if (!groupId || !specialistId || !specialistSubject) return;
    try {
      await assignSpecialist(Number(groupId), { teacher: Number(specialistId), subject: specialistSubject });
      Alert.alert(i18n.t('groupDetail.specialistAssigned'));
      setSpecialistId("");
      setSpecialistSubject("");
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const assignVocalParent = async () => {
    if (!groupId || !vocalParentId) return;
    try {
      await assignVocal(Number(groupId), Number(vocalParentId));
      Alert.alert(i18n.t('groupDetail.vocalAssigned'));
      setVocalParentId("");
      await load();
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const deactivate = async (id: number) => {
    try {
      await deactivateVocal(id);
      await load();
    } catch (e: any) {
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>{i18n.t('groupDetail.title')}</Text>
      <TextInput
        placeholder={i18n.t('groupDetail.groupId')}
        value={groupId}
        onChangeText={setGroupId}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        keyboardType="numeric"
      />
      <Button title={i18n.t('groupDetail.load')} onPress={load} />

      {group && (
        <View style={{ marginTop: 16 }}>
          <Text>{i18n.t('groupDetail.nameLabel', { name: group.name })}</Text>
          <Text>{i18n.t('groupDetail.gradeLabel', { grade: group.grade_level })}</Text>
        </View>
      )}

      {members && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '600' }}>{i18n.t('groupDetail.membersTitle')}</Text>
          <Text>{i18n.t('groupDetail.studentsTitle')}</Text>
          {members.students?.map((s: any) => (
            <Text key={s.id}>{s.first_name} {s.last_name}</Text>
          ))}
          <Text style={{ marginTop: 8 }}>{i18n.t('groupDetail.parentsTitle')}</Text>
          {members.parents?.map((p: any) => (
            <Text key={p.id}>{p.first_name} {p.last_name}</Text>
          ))}
          <Text style={{ marginTop: 8 }}>{i18n.t('groupDetail.teachersTitle')}</Text>
          {members.teachers?.homeroom && (
            <Text>{i18n.t('groupDetail.homeroomLabel', { name: `${members.teachers.homeroom.first_name} ${members.teachers.homeroom.last_name}` })}</Text>
          )}
          {members.teachers?.specialists?.map((t: any) => (
            <Text key={t.id}>{i18n.t('groupDetail.specialistLabel', { name: `${t.first_name} ${t.last_name}` })}</Text>
          ))}
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '600' }}>{i18n.t('groupDetail.vocalsTitle')}</Text>
        {vocals.map((v) => (
          <View key={v.id} style={{ paddingVertical: 4 }}>
            <Text>{i18n.t('groupDetail.vocalLabel', { parentId: v.parent })}</Text>
            {v.active && <Button title={i18n.t('groupDetail.deactivate')} onPress={() => deactivate(v.id)} />}
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '600' }}>{i18n.t('groupDetail.assignmentsTitle')}</Text>
        <TextInput
          placeholder={i18n.t('groupDetail.homeroomId')}
          value={homeroomId}
          onChangeText={setHomeroomId}
          style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
          keyboardType="numeric"
        />
        <Button title={i18n.t('groupDetail.assignHomeroom')} onPress={assignHomeroomTeacher} />

        <TextInput
          placeholder={i18n.t('groupDetail.specialistId')}
          value={specialistId}
          onChangeText={setSpecialistId}
          style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
          keyboardType="numeric"
        />
        <TextInput
          placeholder={i18n.t('groupDetail.subject')}
          value={specialistSubject}
          onChangeText={setSpecialistSubject}
          style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
        />
        <Button title={i18n.t('groupDetail.assignSpecialist')} onPress={assignSpecialistTeacher} />

        <TextInput
          placeholder={i18n.t('groupDetail.vocalParentId')}
          value={vocalParentId}
          onChangeText={setVocalParentId}
          style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
          keyboardType="numeric"
        />
        <Button title={i18n.t('groupDetail.assignVocal')} onPress={assignVocalParent} />
      </View>
    </ScrollView>
  );
}
