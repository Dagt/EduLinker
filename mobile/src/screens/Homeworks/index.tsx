import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiGet, postActivityPhoto, uploadFile } from "../../api";

export default function Homeworks(){
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ try{ const data = await apiGet("/homeworks/"); setItems(data); }catch{ setItems([]);} })(); },[]);
  const pick = async () => {
    try{
      const img = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if(img.canceled) return;
      const uri = img.assets[0].uri;
      const url = await uploadFile(uri, "image/jpeg");
      await postActivityPhoto({ url });
    }catch{
      Alert.alert("Error", "No se pudo subir la imagen");
    }
  };
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:18, marginBottom:8}}>Tareas</Text>
      <Button title="Subir Foto" onPress={pick} />
      <FlatList data={items} keyExtractor={(x)=>String(x.id)}
        ListEmptyComponent={<Text>No hay tareas</Text>}
        renderItem={({item})=> <Text>- {item.title || item.name}</Text>} />
    </View>
  );
}
