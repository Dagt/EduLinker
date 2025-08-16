import { useState } from "react";
import { View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiPostAuth } from "../api";

interface Props {
  onPhoto?: (url: string) => void;
}

export default function PhotoPicker({ onPhoto }: Props) {
  const [image, setImage] = useState<string | null>(null);

  async function requestPermissions() {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  async function handleAsset(asset: ImagePicker.ImagePickerAsset) {
    try {
      setImage(asset.uri);
      const filename = asset.fileName || "photo.jpg";
      const { upload, file_url } = await apiPostAuth("/storage/presign-upload/", {
        filename,
      });
      const fd = new FormData();
      Object.entries(upload.fields).forEach(([k, v]) => fd.append(k, v as string));
      fd.append(
        "file",
        {
          uri: asset.uri,
          name: filename,
          type: asset.mimeType || "image/jpeg",
        } as any
      );
      fd.append("Content-Type", asset.mimeType || "image/jpeg");
      const s3Res = await fetch(upload.url, { method: "POST", body: fd });
      if (!s3Res.ok) throw new Error("Upload failed");
      onPhoto && onPhoto(file_url);
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
    </View>
  );
}

