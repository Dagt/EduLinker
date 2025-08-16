import { useState } from "react";
import { View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createExpenseEvidence, uploadFile } from "../api";

interface Props {
  ledgerId: number;
  groupId?: number;
  amount: number;
  concept: string;
  onUploaded?: () => void;
}

export default function UploadEvidence({ ledgerId, groupId, amount, concept, onUploaded }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function requestPermissions() {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  async function handleAsset(asset: ImagePicker.ImagePickerAsset) {
    try {
      setImage(asset.uri);
      const url = await uploadFile(asset.uri, asset.mimeType || "image/jpeg");
      setFileUrl(url);
    } catch (e) {
      console.error(e);
    }
  }

  function handleResult(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled) {
      handleAsset(result.assets[0]);
    }
  }

  async function takePhoto() {
    await requestPermissions();
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    handleResult(result);
  }

  async function pickImage() {
    await requestPermissions();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    handleResult(result);
  }

  async function upload() {
    if (!fileUrl) return;
    try {
      await createExpenseEvidence({
        ledger: ledgerId,
        group: groupId,
        file_url: fileUrl,
        amount: String(amount),
        concept,
      });
      setImage(null);
      setFileUrl(null);
      onUploaded && onUploaded();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View>
      <Button title="Tomar foto" onPress={takePhoto} />
      <Button title="Seleccionar foto" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, marginVertical: 8 }}
        />
      )}
      {fileUrl && <Button title="Subir" onPress={upload} />}
    </View>
  );
}
