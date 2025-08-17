"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import UploadButton from "@/components/UploadButton";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

interface ActivityPhoto {
  id: number;
  photo_url: string;
}

export default function ActivityPhotosPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ActivityPhoto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const data = await apiGet<ActivityPhoto[]>(`/groups/${params.id}/activity-photos/`, tk);
        setItems(data);
      } catch (e: any) {
        setError(e.message || t("ActivityPhotos.error"));
      }
    }
    load();
  }, [params.id, t]);

  async function handleUploaded(url: string) {
    try {
      const tk = getToken();
      const newPhoto = await apiPost<ActivityPhoto>("/activity-photos/", { group: Number(params.id), photo_url: url }, tk);
      setItems([...items, newPhoto]);
    } catch (e: any) {
      alert(e.message || t("ActivityPhotos.error"));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("ActivityPhotos.title")}</h2>
        {error && <p>{error}</p>}
        {requireRole(["teacher", "vocal"]) && (
          <div style={{ marginBottom: 16 }}>
            <span>{t("ActivityPhotos.upload")}: </span>
            <UploadButton onUploaded={handleUploaded} />
          </div>
        )}
        {items.length === 0 ? (
          <p>{t("ActivityPhotos.empty")}</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {items.map((p) => (
              <a key={p.id} href={p.photo_url} download>
                <img
                  src={p.photo_url}
                  alt=""
                  style={{ width: 200, height: 200, objectFit: "cover" }}
                />
              </a>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
