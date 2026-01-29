import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import { listUsers, createUser, updateUserRole } from "../api";
import i18n from "../i18n";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export default function AdminUsers(){
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ name: "", email: "", role: "", status: "" });
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", role: "DIRECTOR", password: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try{
      const data = await listUsers({
        name: filters.name || undefined,
        email: filters.email || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      });
      setUsers(Array.isArray(data?.results) ? data.results : data);
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  const submitCreate = async () => {
    try{
      await createUser(form);
      Alert.alert(i18n.t('adminUsers.created'));
      setForm({ first_name: "", last_name: "", email: "", role: "DIRECTOR", password: "" });
      await load();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  const saveRole = async (user: User, role: string, is_active: boolean) => {
    try{
      await updateUserRole(user.id, { role, is_active });
      await load();
    }catch(e: any){
      Alert.alert(i18n.t('general.error'), e.message || '');
    }
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>{i18n.t('adminUsers.title')}</Text>
      <Text style={{fontWeight:'600', marginTop:8}}>{i18n.t('adminUsers.filters')}</Text>
      <TextInput
        placeholder={i18n.t('adminUsers.filterName')}
        value={filters.name}
        onChangeText={(value)=>setFilters({ ...filters, name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.filterEmail')}
        value={filters.email}
        onChangeText={(value)=>setFilters({ ...filters, email: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.filterRole')}
        value={filters.role}
        onChangeText={(value)=>setFilters({ ...filters, role: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Button title={i18n.t('adminUsers.applyFilters')} onPress={load} />

      <Text style={{fontWeight:'600', marginTop:16}}>{i18n.t('adminUsers.createTitle')}</Text>
      <TextInput
        placeholder={i18n.t('adminUsers.firstName')}
        value={form.first_name}
        onChangeText={(value)=>setForm({ ...form, first_name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.lastName')}
        value={form.last_name}
        onChangeText={(value)=>setForm({ ...form, last_name: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.email')}
        value={form.email}
        onChangeText={(value)=>setForm({ ...form, email: value })}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.role')}
        value={form.role}
        onChangeText={(value)=>setForm({ ...form, role: value })}
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <TextInput
        placeholder={i18n.t('adminUsers.password')}
        value={form.password}
        onChangeText={(value)=>setForm({ ...form, password: value })}
        secureTextEntry
        style={{borderWidth:1, padding:8, marginBottom:8}}
      />
      <Button title={i18n.t('adminUsers.create')} onPress={submitCreate} />

      <Text style={{fontWeight:'600', marginTop:16}}>{i18n.t('adminUsers.listTitle')}</Text>
      {loading && <Text>{i18n.t('general.loading')}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item)=>String(item.id)}
        ListEmptyComponent={<Text>{i18n.t('general.noItems')}</Text>}
        renderItem={({item}) => (
          <View style={{paddingVertical:8, borderBottomWidth:1, borderColor:'#eee'}}>
            <Text>{item.first_name} {item.last_name}</Text>
            <Text>{item.email}</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
              <TextInput
                style={{borderWidth:1, padding:6, flex:1}}
                value={item.role}
                onChangeText={(value)=>setUsers(users.map(u=>u.id===item.id ? { ...u, role: value } : u))}
              />
              <Button
                title={item.is_active === false ? i18n.t('adminUsers.activate') : i18n.t('adminUsers.deactivate')}
                onPress={()=>saveRole(item, item.role, !(item.is_active === false))}
              />
              <Button
                title={i18n.t('adminUsers.save')}
                onPress={()=>saveRole(item, item.role, item.is_active !== false)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
