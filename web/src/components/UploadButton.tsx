"use client";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type Props = { onUploaded: (fileUrl: string) => void };

export default function UploadButton({ onUploaded }: Props) {
  const t = useTranslations("UploadButton");

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const tk = getToken();

    // 1) pedir presign
    const presignRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storage/presign-upload/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tk}`,
          "X-School-ID": process.env.NEXT_PUBLIC_SCHOOL_ID || "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name }),
      }
    );
    if (!presignRes.ok) {
      alert(t("presignError"));
      return;
    }
    const { upload, file_url } = await presignRes.json();

    // 2) subir a S3/MinIO con form-data
    const fd = new FormData();
    Object.entries(upload.fields).forEach(([k, v]) => fd.append(k, v as string));
    fd.append("Content-Type", file.type || "application/octet-stream");
    fd.append("file", file);

    const s3Res = await fetch(upload.url, { method: "POST", body: fd });
    if (!s3Res.ok) {
      alert(t("s3Error"));
      return;
    }

    onUploaded(file_url);
    (e.target as HTMLInputElement).value = "";
  }

  return <input type="file" onChange={handle} />;
}
