"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { getMe } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setProfile(me);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleCopy = async () => {
    if (!profile?.calendar_subscription_url) return;
    try {
      await navigator.clipboard.writeText(profile.calendar_subscription_url);
      setCopyStatus(t("Profile.copied"));
    } catch (err) {
      console.error(err);
      setCopyStatus(t("Profile.copyError"));
    }
  };

  return (
    <>
      <Nav />
      <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <h2>{t("Profile.header")}</h2>
        {!profile ? (
          <p>{t("General.loading")}</p>
        ) : (
          <section style={{ display: "grid", gap: 12 }}>
            <div>
              <strong>{t("Profile.name")}</strong>
              <div>{profile.first_name} {profile.last_name}</div>
            </div>
            <div>
              <strong>{t("Profile.email")}</strong>
              <div>{profile.email}</div>
            </div>
            <div>
              <strong>{t("Profile.role")}</strong>
              <div>{profile.role}</div>
            </div>
            <div>
              <strong>{t("Profile.icsToken")}</strong>
              <div style={{ fontFamily: "monospace" }}>{profile.ics_token}</div>
            </div>
            <div>
              <strong>{t("Profile.calendarLink")}</strong>
              <div style={{ wordBreak: "break-all" }}>{profile.calendar_subscription_url}</div>
            </div>
            <button onClick={handleCopy} style={{ padding: "8px 12px", width: "fit-content" }}>
              {t("Profile.copyLink")}
            </button>
            {copyStatus && <p>{copyStatus}</p>}
            <p style={{ color: "#6b7280" }}>{t("Profile.confidential")}</p>
          </section>
        )}
      </main>
    </>
  );
}
