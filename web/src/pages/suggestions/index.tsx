import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { listSuggestions, createSuggestion, deleteSuggestion, Suggestion } from "@/services/suggestions";

type FormData = { title: string; description: string };

export default function SuggestionsPage() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const t = useTranslations("Suggestions");

  useEffect(() => {
    (async () => {
      try {
        const data = await listSuggestions();
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function onSubmit(data: FormData) {
    try {
      const created = await createSuggestion(data);
      setItems([...items, created]);
      reset();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: number) {
    if (typeof window !== "undefined" && !window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteSuggestion(id);
      setItems(items.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding: 16, maxWidth: 560 }}>
        <h2>{t("header")}</h2>
        <p>
          <Link href="/suggestions/create">{t("createLink")}</Link>
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="suggestion-title">{t("title")}</label>
          <input
            id="suggestion-title"
            placeholder={t("title")}
            {...register("title", { required: true })}
            aria-required="true"
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          />
          <label htmlFor="suggestion-description">{t("description")}</label>
          <textarea
            id="suggestion-description"
            placeholder={t("description")}
            {...register("description")}
            style={{ display: "block", margin: "8px 0", padding: 8, width: "100%", minHeight: 120 }}
          />
          <button type="submit">{t("send")}</button>
        </form>
        <ul>
          {items.map((s) => (
            <li key={s.id}>
              <Link href={`/suggestions/${s.id}`}>{s.title}</Link>: {s.description}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                style={{ marginLeft: 8 }}
                aria-label={t("deleteAria", { title: s.title })}
              >
                {t("delete")}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
