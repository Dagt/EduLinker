import { Alert, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, postEventPhoto } from '../api';

interface Props {
  eventId: number;
}

export default function EventPhotoUploader({ eventId }: Props) {
  async function pickAndUpload() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const url = await uploadFile(uri, 'image/jpeg');
      await postEventPhoto(eventId, { url });
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  }

  return (
    <Button title="Subir Foto" onPress={pickAndUpload} testID={`photo-${eventId}`} />
  );
}
