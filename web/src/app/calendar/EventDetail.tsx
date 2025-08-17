"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EventPhotoGallery from "./EventPhotoGallery";
import { useTranslation } from "react-i18next";
import "@/i18n";

interface Event {
  id: number;
  title: string;
  start_at: string;
}

interface Attachment {
  id: number;
  file_url: string;
  filename: string;
}

interface Props {
  eventId: number;
}

export default function EventDetail({ eventId }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const tk = getToken();
      const ev = await apiGet<Event>(`/events/${eventId}/`, tk);
      setEvent(ev);
      const at = await apiGet<Attachment[]>(
        `/events/${eventId}/attachments/`,
        tk
      );
      setAttachments(at);
    })();
  }, [eventId]);

  if (!event) return <div>{t("General.loading")}</div>;

  return (
    <div>
      <h3>{event.title}</h3>
      <p>
        {t("EventDetail.date")}: {new Date(event.start_at).toLocaleString()}
      </p>
      <h4>{t("EventDetail.attachments")}</h4>
      <ul>
        {attachments.map((a) => (
          <li key={a.id}>
            <a href={a.file_url} download>
              {a.filename}
            </a>
          </li>
        ))}
      </ul>
      <EventPhotoGallery eventId={eventId} />
    </div>
  );
}
