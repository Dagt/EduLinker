"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requireRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

interface ChatMessage {
  id: number;
  author_display: string;
  author_role?: string;
  message_text?: string;
  attachment_url?: string;
}

export default function ChatAuditPage({ params }: { params: { groupId: string } }) {
  const { t } = useTranslation();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const tk = getToken();
        const data = await apiGet<ChatMessage[]>(`/chats/${params.groupId}/messages/?audit=true`, tk);
        setMsgs(data);
      } catch (e: any) {
        setError(e.message || t("ChatAudit.error"));
      }
    }
    load();
  }, [params.groupId, t]);

  if (!requireRole(["director"])) return <p>{t("GroupList.unauthorized")}</p>;

  return (
    <>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("ChatAudit.header")}</h2>
        {error && <p>{error}</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {msgs.map((m) => (
            <li key={m.id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{m.author_display}</strong>
                {m.author_role && (
                  <span style={{ marginLeft: 4, fontSize: 12 }}>({m.author_role})</span>
                )}
              </div>
              {m.attachment_url && (
                <div>
                  <img src={m.attachment_url} alt="" style={{ maxWidth: 200 }} />
                </div>
              )}
              {m.message_text && <p>{m.message_text}</p>}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

