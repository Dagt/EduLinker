import { useState } from "react";
import { View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiPostAuth } from "../api";

interface Props {
  ledgerId: number;
  groupId?: number;
  amount: number;
  concept: string;
  onUploaded?: () => void;
}

export default function UploadEvidence({ ledgerId, groupId, amount, concept, onUploaded }: Props) {
  const [image, setImage] = useState<string | null>(null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(`data:image/jpeg;base64,${asset.base64}`);
    }
  }

  async function upload() {
    if (!image) return;
    try {
      await apiPostAuth("/fundraising/expense-evidences/", {
        ledger: ledgerId,
        group: groupId,
        file_url: image,
        amount,
        concept,
      });
      setImage(null);
      onUploaded && onUploaded();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View>
      <Button title="Seleccionar foto" onPress={pickImage} />
      {image && (
        <>
          <Image source={{ uri: image }} style={{ width: 200, height: 200, marginVertical: 8 }} />
          <Button title="Subir" onPress={upload} />
        </>
      )}
    </View>
  );
}
