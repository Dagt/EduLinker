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
      <main className="page">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("ChatAudit.pill", { defaultValue: "Auditoria" })}</span>
            <h2>{t("ChatAudit.header")}</h2>
            <p className="subtle">
              {t("ChatAudit.subtitle", { defaultValue: "Mensajes enviados en el grupo." })}
            </p>
          </div>
        </header>
        {error && <p className="alert error">{error}</p>}
        <ul className="messages">
          {msgs.map((m) => (
            <li key={m.id}>
              <div className="card-header">
                <strong>{m.author_display}</strong>
                {m.author_role && <span className="meta">{m.author_role}</span>}
              </div>
              {m.attachment_url && (
                <div className="media-card" style={{ maxWidth: 240 }}>
                  <img src={m.attachment_url} alt="" />
                </div>
              )}
              {m.message_text && <p className="subtle">{m.message_text}</p>}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

