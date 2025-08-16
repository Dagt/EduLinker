"use client";
import { useState } from "react";
import { getToken } from "@/lib/auth";
import { createFundraisingLedger } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { requireRole } from "@/lib/roles";

export default function LedgerForm() {
  const { t } = useTranslation();
  const [eventId, setEventId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const allowed = requireRole(["admin", "treasurer"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = getToken();
      const res = await createFundraisingLedger(
        {
          event_id: Number(eventId),
          group_id: Number(groupId),
          amount_collected: Number(amount),
          notes,
        },
        tk,
      );
      setMsg(t("FundraisingLedger.success", { id: res.id }));
      setAmount("");
      setNotes("");
    } catch (e: any) {
      setMsg(e.message || t("FundraisingLedger.error"));
    }
  }

  if (!allowed) return <p>{t("FundraisingLedger.unauthorized")}</p>;

  return (
    <main style={{ padding: 16, maxWidth: 680 }}>
      <h2>{t("FundraisingLedger.header")}</h2>
      <form onSubmit={submit}>
        <input
          placeholder={t("FundraisingLedger.eventId")}
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          required
        />
        <input
          placeholder={t("FundraisingLedger.groupId")}
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          required
        />
        <input
          placeholder={t("FundraisingLedger.amount")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          required
        />
        <textarea
          placeholder={t("FundraisingLedger.notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            display: "block",
            margin: "8px 0",
            padding: 8,
            width: "100%",
            minHeight: 100,
          }}
        />
        <button>{t("FundraisingLedger.save")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}

