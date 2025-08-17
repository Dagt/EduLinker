"use client";
import { useState } from "react";
import UploadButton from "@/components/UploadButton";
import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Props {
  eventId: number;
  onUploaded?: () => void;
}

export default function EventPhotoUploader({ eventId, onUploaded }: Props) {
  const [caption, setCaption] = useState("");

  async function handleUpload(url: string) {
    const tk = getToken();
    await apiPost(`/events/${eventId}/photos/`, { photo_url: url, caption }, tk);
    setCaption("");
    onUploaded?.();
  }

  return (
    <div>
      <input
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <UploadButton onUploaded={handleUpload} />
    </div>
  );
}
