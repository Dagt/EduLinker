import { useEffect, useState } from 'react';
import { View, Text, Button, Image, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { apiGet, apiPost } from '../api';
import { getRole } from '../role';
import { pickAndUpload } from '../services/uploads';
import i18n from '../i18n';

interface Attachment {
  id: number;
  file_url: string;
  filename: string;
}

interface Photo {
  id: number;
  photo_url: string;
  caption: string;
}

interface Event {
  id: number;
  title: string;
  start_at: string;
}

interface Props {
  eventId: number;
}

export default function EventDetail({ eventId }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [role, setRole] = useState('guest');

  useEffect(() => {
    (async () => {
      setRole(await getRole());
      const ev = await apiGet(`/events/${eventId}/`);
      setEvent(ev);
      const at = await apiGet(`/events/${eventId}/attachments/`);
      setAttachments(at);
      const ph = await apiGet(`/events/${eventId}/photos/`);
      setPhotos(ph);
    })();
  }, [eventId]);

  async function upload() {
    try {
      const url = await pickAndUpload();
      if (!url) return;
      const filename = url.split('/').pop() || 'file';
      await apiPost(`/events/${eventId}/attachments/`, { file_url: url, filename, mime: '' });
      const at = await apiGet(`/events/${eventId}/attachments/`);
      setAttachments(at);
    } catch (e) {
      Alert.alert(i18n.t('general.error'));
    }
  }

  const canUpload = ['DIRECTOR', 'MAESTRO_TITULAR', 'MAESTRO_ITINERANTE', 'VOCAL'].includes(role);

  if (!event) return <Text>{i18n.t('general.loading')}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>{event.title}</Text>
      <Text>{event.start_at}</Text>
      <Text style={{ marginTop: 8 }}>{i18n.t('eventDetail.attachments')}</Text>
      {attachments.map((a) => (
        <TouchableOpacity key={a.id} onPress={() => Linking.openURL(a.file_url)}>
          <Text style={{ color: 'blue' }}>{a.filename}</Text>
        </TouchableOpacity>
      ))}
      {canUpload && (
        <Button title={i18n.t('eventDetail.upload')} onPress={upload} testID="upload-attachment" />
      )}
      <FlatList
        data={photos}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <Image source={{ uri: item.photo_url }} style={{ width: 200, height: 200, marginVertical: 4 }} />
        )}
      />
    </View>
  );
}
