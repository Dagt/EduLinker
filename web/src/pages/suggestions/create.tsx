import { useState } from "react";
import Nav from "@/components/Nav";
import { useTranslations } from "next-intl";
import { createSuggestion } from "@/services/suggestions";

export default function CreateSuggestionPage() {
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const t = useTranslations("SuggestionCreate");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!title.trim() || !description.trim()) {
      setMsg(t("missing"));
      return;
    }
    if (typeof window !== "undefined" && !window.confirm(t("confirm"))) return;
    try {
      await createSuggestion({
        group: groupId ? Number(groupId) : null,
        title,
        description,
      });
      setMsg(t("created"));
      setGroupId("");
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setMsg(err.message || t("error"));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding: 16, maxWidth: 560 }}>
        <h2>{t("header")}</h2>
        <form onSubmit={submit}>
          <label htmlFor="suggestion-group">{t("groupId")}</label>
          <input
            id="suggestion-group"
            placeholder={t("groupId")}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <label htmlFor="suggestion-title">{t("title")}</label>
          <input
            id="suggestion-title"
            placeholder={t("title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <label htmlFor="suggestion-description">{t("description")}</label>
          <textarea
            id="suggestion-description"
            placeholder={t("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-required="true"
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%", minHeight: 120 }}
          />
          <button type="submit">{t("create")}</button>
        </form>
        {msg && (
          <p role="status" aria-live="polite">
            {msg}
          </p>
        )}
      </main>
    </>
  );
}
