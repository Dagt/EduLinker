import { useState } from "react";
import { View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface Props {
  onPhoto?: (data: string) => void;
}

export default function PhotoPicker({ onPhoto }: Props) {
  const [image, setImage] = useState<string | null>(null);

  async function requestPermissions() {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  function handleResult(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = `data:image/jpeg;base64,${asset.base64}`;
      setImage(uri);
      onPhoto && onPhoto(uri);
    }
  }

  async function takePhoto() {
    await requestPermissions();
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    handleResult(result);
  }

  async function pickImage() {
    await requestPermissions();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
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

