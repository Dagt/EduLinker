import { useState } from "react";
import { View, Button } from "react-native";
import { apiPostAuth } from "../api";
import PhotoPicker from "./PhotoPicker";

interface Props {
  ledgerId: number;
  groupId?: number;
  amount: number;
  concept: string;
  onUploaded?: () => void;
}

export default function UploadEvidence({ ledgerId, groupId, amount, concept, onUploaded }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState(0);

  async function upload() {
    if (!fileUrl) return;
    try {
      await apiPostAuth("/expense-evidences/", {
        ledger: ledgerId,
        group: groupId,
        file_url: fileUrl,
        amount,
        concept,
      });
      setFileUrl(null);
      setPickerKey((k) => k + 1);
      onUploaded && onUploaded();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View>
      <PhotoPicker key={pickerKey} onPhoto={setFileUrl} />
      {fileUrl && <Button title="Subir" onPress={upload} />}
    </View>
  );
}
