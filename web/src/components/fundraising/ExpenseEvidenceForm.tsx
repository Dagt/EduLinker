"use client";
import { useState } from "react";
import { getToken } from "@/lib/auth";
import { createExpenseEvidence } from "@/lib/api";
import UploadButton from "@/components/UploadButton";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { requireRole } from "@/lib/roles";

export default function ExpenseEvidenceForm() {
  const { t } = useTranslation();
  const [ledgerId, setLedgerId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [msg, setMsg] = useState("");
  const allowed = requireRole(["admin", "treasurer"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!fileUrl) {
      setMsg(t("FundraisingExpense.uploadFirst"));
      return;
    }
    try {
      const tk = getToken();
      const body: any = { amount: Number(amount), concept, file_url: fileUrl };
      if (ledgerId) body.ledger_id = Number(ledgerId);
      if (groupId) body.group_id = Number(groupId);
      const res = await createExpenseEvidence(body, tk);
      setMsg(t("FundraisingExpense.success", { id: res.id }));
      setAmount("");
      setConcept("");
      setFileUrl("");
      setLedgerId("");
      setGroupId("");
    } catch (e: any) {
      setMsg(e.message || t("FundraisingExpense.error"));
    }
  }

  if (!allowed) return <p>{t("FundraisingExpense.unauthorized")}</p>;

  return (
    <main style={{ padding: 16, maxWidth: 680 }}>
      <h2>{t("FundraisingExpense.header")}</h2>
      <UploadButton onUploaded={(u) => setFileUrl(u)} />
      {fileUrl && <p>{t("FundraisingExpense.fileReady", { url: fileUrl })}</p>}
      <form onSubmit={submit}>
        <input
          placeholder={t("FundraisingExpense.ledgerId")}
          value={ledgerId}
          onChange={(e) => setLedgerId(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
        />
        <input
          placeholder={t("FundraisingExpense.groupId")}
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
        />
        <input
          placeholder={t("FundraisingExpense.amount")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          required
        />
        <input
          placeholder={t("FundraisingExpense.concept")}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: 8, width: "100%" }}
          required
        />
        <button>{t("FundraisingExpense.save")}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}

