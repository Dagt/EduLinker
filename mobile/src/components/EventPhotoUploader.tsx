import { Alert, Button } from 'react-native';
import { postEventPhoto } from '../api';
import { pickAndUpload } from '../services/uploads';

interface Props {
  eventId: number;
}

export default function EventPhotoUploader({ eventId }: Props) {
  async function handle() {
    try {
      const url = await pickAndUpload();
      if (!url) return;
      await postEventPhoto(eventId, { photo_url: url });
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  }

  return (
    <Button title="Subir Foto" onPress={handle} testID={`photo-${eventId}`} />
  );
}
