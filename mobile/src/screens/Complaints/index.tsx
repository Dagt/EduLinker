import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import { getComplaints, createComplaint, getComplaintMessages, sendComplaintMessage } from "../../api";

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
    if(!content || !groupId || !teacherId) return;
    const body:any = {
      group_id: Number(groupId),
      target_teacher_id: Number(teacherId),
      description: content,
    };
    if(studentId) body.about_student_id = Number(studentId);
    await createComplaint(body);
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
    if(!selected || !message) return;
    const msg = await sendComplaintMessage(selected.id, { content: message });
    setMessage("");
    setSelected({ ...selected, messages: [ ...(selected.messages||[]), msg ] });
  };

  if(selected){
    return (
      <View style={{padding:16}}>
        <Text style={{fontSize:18, marginBottom:8}}>{selected.title || selected.description || selected.content}</Text>
        <FlatList data={selected.messages || []} keyExtractor={(x)=>String(x.id)}
          ListEmptyComponent={<Text>No hay mensajes</Text>}
          renderItem={({item})=> <Text>- {item.content}</Text>} />
        <TextInput placeholder="Mensaje" value={message} onChangeText={setMessage} />
        <Button title="Enviar" onPress={sendMessageFn} />
        <Button title="Volver" onPress={()=>{ setSelected(null); loadComplaints(); }} />
      </View>
    );
  }

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Quejas</Text>
      <TextInput placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
      <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} />
      <TextInput placeholder="Student ID (optional)" value={studentId} onChangeText={setStudentId} />
      <TextInput placeholder="Escribe tu queja" value={content} onChangeText={setContent} />
      <Button title="Enviar" onPress={submitComplaint} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay quejas</Text>}
        renderItem={({item})=> (
          <Text onPress={()=>openComplaint(item)}>- {item.title || item.description || item.content}</Text>
        )} />
    </View>
  );
}

