import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import { getComplaints, createComplaint, getComplaintMessages, sendComplaintMessage } from "../../api";
import i18n from "../../i18n";

export default function Complaints(){
  const [items, setItems] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const loadComplaints = async () => {
    try{
      const data = await getComplaints();
      setItems(data);
    }catch{
      setItems([]);
    }
  };

  useEffect(()=>{ loadComplaints(); },[]);

  const submitComplaint = async () => {
    if(!content || !groupId || !teacherId){
      Alert.alert(i18n.t('general.error'), i18n.t('complaints.requiredComplaint'));
      return;
    }
    await createComplaint({
      content,
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      ...(studentId ? { about_student_id: Number(studentId) } : {})
    });
    setContent("");
    setGroupId("");
    setTeacherId("");
    setStudentId("");
    await loadComplaints();
  };

  const openComplaint = async (c: any) => {
    setSelected(c);
    try{
      const msgs = await getComplaintMessages(c.id);
      setSelected({ ...c, messages: msgs });
    }catch{
      setSelected({ ...c, messages: [] });
    }
  };

  const sendMessageFn = async () => {
    if(!selected) return;
    if(!message){
      Alert.alert(i18n.t('general.error'), i18n.t('complaints.requiredMessage'));
      return;
    }
    const msg = await sendComplaintMessage(selected.id, { content: message });
    setMessage("");
    setSelected({ ...selected, messages: [ ...(selected.messages||[]), msg ] });
  };

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.title || selected.content}</Text>
        <FlatList data={selected.messages || []} keyExtractor={(x)=>String(x.id)}
          ListEmptyComponent={<Text>{i18n.t('complaints.messagesNone')}</Text>}
          renderItem={({item})=> <Text>- {item.content}</Text>} />
        <TextInput placeholder={i18n.t('complaints.messagePlaceholder')} value={message} onChangeText={setMessage} />
        <Button title={i18n.t('complaints.send')} onPress={sendMessageFn} />
        <Button title={i18n.t('complaints.back')} onPress={()=>{ setSelected(null); loadComplaints(); }} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('complaints.title')}</Text>
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder="Student ID (optional)" value={studentId} onChangeText={setStudentId} />
      <TextInput placeholder={i18n.t('complaints.placeholder')} value={content} onChangeText={setContent} />
      <Button title={i18n.t('complaints.send')} onPress={submitComplaint} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>{i18n.t('complaints.none')}</Text>}
        renderItem={({item})=> (
          <Text onPress={()=>openComplaint(item)}>- {item.title || item.content}</Text>
        )} />
    </View>
  );
}

