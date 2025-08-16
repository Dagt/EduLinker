import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../api';

/**
 * Opens the image library, uploads the selected image using a signed URL
 * and returns the remote file URL. Returns null if the user cancels the picker.
 */
export async function pickAndUpload(mime: string = 'image/jpeg'): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  if (result.canceled) return null;
  const uri = result.assets[0].uri;
  return uploadFile(uri, mime);
}
