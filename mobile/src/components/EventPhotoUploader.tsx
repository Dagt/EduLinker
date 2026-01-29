import { Alert, Button } from 'react-native';
import { postEventPhoto } from '../api';
import { pickAndUpload } from '../services/uploads';
import i18n from '../i18n';

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
      Alert.alert(i18n.t('general.error'), i18n.t('uploads.uploadFailed'));
    }
  }

  return (
    <Button
      title={i18n.t('uploads.uploadPhoto')}
      onPress={handle}
      testID={`photo-${eventId}`}
    />
  );
}
