import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { apiGet, postActivityPhoto } from "../../api";
import { pickAndUpload } from "../../services/uploads";

export default function Homeworks(){
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ try{ const data = await apiGet("/homeworks/"); setItems(data); }catch{ setItems([]);} })(); },[]);

  const upload = async (homework: any) => {
    try{
      const url = await pickAndUpload();
      if(!url) return;
      await postActivityPhoto({ homework: homework.id, photo_url: url });
    }catch{
      Alert.alert("Error", "No se pudo subir la imagen");
    }
  };

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Tareas</Text>
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay tareas</Text>}
        renderItem={({item})=> (
          <View style={{marginBottom:8}}>
            <Text>- {item.title || item.name}</Text>
            <Button title="Subir evidencia" onPress={() => upload(item)} />
          </View>
        )} />
    </View>
  );
}
