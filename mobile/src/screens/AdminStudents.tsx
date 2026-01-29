import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { listStudents, createStudent, updateStudent } from "../api";
import i18n from "../i18n";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  grade_level: number;
  enrollment_code: string;
}

export default function AdminStudents(){
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ name: "", grade_level: "" });
  const [form, setForm] = useState({ first_name: "", last_name: "", grade_level: "", enrollment_code: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try{
      const data = await listStudents({
        name: filters.name || undefined,
        grade_level: filters.grade_level || undefined,
      });
      setStudents(Array.isArray(data?.results) ? data.results : data);
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  const submitCreate = async () => {
    try{
      await createStudent({
        first_name: form.first_name,
        last_name: form.last_name,
        grade_level: Number(form.grade_level),
        enrollment_code: form.enrollment_code,
      });
      Alert.alert(i18n.t('adminStudents.created'));
      setForm({ first_name: "", last_name: "", grade_level: "", enrollment_code: "" });
      await load();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const saveStudent = async (student: Student) => {
    try{
      await updateStudent(student.id, {
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
        enrollment_code: student.enrollment_code,
      });
      await load();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('adminStudents.title')}</Text>
      <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('adminStudents.filters')}</Text>
      <TextInput
        placeholder={i18n.t('adminStudents.filterName')}
        value={filters.name}
        onChangeText={(value)=>setFilters({ ...filters, name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminStudents.filterGrade')}
        value={filters.grade_level}
        onChangeText={(value)=>setFilters({ ...filters, grade_level: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Button title={i18n.t('adminStudents.applyFilters')} onPress={load} />

      <Text style={{fontWeight:'600', marginTop:16}}>{i18n.t('adminStudents.createTitle')}</Text>
      <TextInput
        placeholder={i18n.t('adminStudents.firstName')}
        value={form.first_name}
        onChangeText={(value)=>setForm({ ...form, first_name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminStudents.lastName')}
        value={form.last_name}
        onChangeText={(value)=>setForm({ ...form, last_name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminStudents.grade')}
        value={form.grade_level}
        onChangeText={(value)=>setForm({ ...form, grade_level: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminStudents.enrollment')}
        value={form.enrollment_code}
        onChangeText={(value)=>setForm({ ...form, enrollment_code: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Button title={i18n.t('adminStudents.create')} onPress={submitCreate} />

      <Text style={{fontWeight:'600', marginTop:16}}>{i18n.t('adminStudents.listTitle')}</Text>
      {loading && <Text>{i18n.t('general.loading')}</Text>}
      <FlatList
        data={students}
        keyExtractor={(item)=>String(item.id)}
        ListEmptyComponent={<Text>{i18n.t('general.noItems')}</Text>}
        renderItem={({item}) => (
          <View style={{paddingVertical:8, borderBottomWidth:1, borderColor:'#eee'}}>
            <TextInput
              style={{borderWidth:1, padding:6, marginBottom:6}}
              value={item.first_name}
              onChangeText={(value)=>setStudents(students.map(s=>s.id===item.id ? { ...s, first_name: value } : s))}
            />
            <TextInput
              style={{borderWidth:1, padding:6, marginBottom:6}}
              value={item.last_name}
              onChangeText={(value)=>setStudents(students.map(s=>s.id===item.id ? { ...s, last_name: value } : s))}
            />
            <TextInput
              style={{borderWidth:1, padding:6, marginBottom:6}}
              value={String(item.grade_level)}
              onChangeText={(value)=>setStudents(students.map(s=>s.id===item.id ? { ...s, grade_level: Number(value) } : s))}
            />
            <TextInput
              style={{borderWidth:1, padding:6, marginBottom:6}}
              value={item.enrollment_code}
              onChangeText={(value)=>setStudents(students.map(s=>s.id===item.id ? { ...s, enrollment_code: value } : s))}
            />
            <Button title={i18n.t('adminStudents.save')} onPress={()=>saveStudent(item)} />
          </View>
        )}
      />
    </View>
  );
}
