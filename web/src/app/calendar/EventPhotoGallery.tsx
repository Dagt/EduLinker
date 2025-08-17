"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface EventPhoto {
  id: number;
  photo_url: string;
  caption: string;
}

interface Props {
  eventId: number;
}

export default function EventPhotoGallery({ eventId }: Props) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);

  useEffect(() => {
    (async () => {
      const tk = getToken();
      const list = await apiGet<EventPhoto[]>(`/events/${eventId}/photos/`, tk);
      setPhotos(list);
    })();
  }, [eventId]);

  return (
    <div>
      {photos.map((p) => (
        <img key={p.id} src={p.photo_url} alt={p.caption || "event photo"} />
      ))}
    </div>
  );
}
