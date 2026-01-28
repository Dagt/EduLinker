"use client";
import { FormEvent, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { changePassword, getMe, regenerateIcsToken, updateMe } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [profileStatus, setProfileStatus] = useState<string>("");
  const [passwordStatus, setPasswordStatus] = useState<string>("");
  const [regenerateStatus, setRegenerateStatus] = useState<string>("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    preferred_language: "es",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setProfile(me);
        setFormData({
          first_name: me.first_name || "",
          last_name: me.last_name || "",
          preferred_language: me.preferred_language || "es",
        });
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

  const refreshProfile = async () => {
    const me = await getMe();
    setProfile(me);
    setFormData({
      first_name: me.first_name || "",
      last_name: me.last_name || "",
      preferred_language: me.preferred_language || "es",
    });
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileStatus("");
    try {
      await updateMe(formData);
      await refreshProfile();
      setProfileStatus(t("Profile.updateSuccess"));
    } catch (err) {
      console.error(err);
      setProfileStatus(t("Profile.updateError"));
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordStatus("");
    try {
      await changePassword(passwordForm);
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setPasswordStatus(t("Profile.passwordSuccess"));
    } catch (err) {
      console.error(err);
      setPasswordStatus(t("Profile.passwordError"));
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm(t("Profile.regenerateConfirm"))) return;
    setRegenerateStatus("");
    try {
      await regenerateIcsToken();
      await refreshProfile();
      setRegenerateStatus(t("Profile.regenerateSuccess"));
    } catch (err) {
      console.error(err);
      setRegenerateStatus(t("Profile.regenerateError"));
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
            <button onClick={handleRegenerate} style={{ padding: "8px 12px", width: "fit-content" }}>
              {t("Profile.regenerateToken")}
            </button>
            {regenerateStatus && <p>{regenerateStatus}</p>}
            <p style={{ color: "#6b7280" }}>{t("Profile.confidential")}</p>
            <hr />
            <form onSubmit={handleProfileSubmit} style={{ display: "grid", gap: 8 }}>
              <strong>{t("Profile.editHeader")}</strong>
              <label>
                {t("Profile.firstName")}
                <input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 320 }}
                />
              </label>
              <label>
                {t("Profile.lastName")}
                <input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 320 }}
                />
              </label>
              <label>
                {t("Profile.preferredLanguage")}
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 200 }}
                >
                  <option value="es">{t("Profile.languageSpanish")}</option>
                  <option value="en">{t("Profile.languageEnglish")}</option>
                </select>
              </label>
              <button type="submit" style={{ padding: "8px 12px", width: "fit-content" }}>
                {t("Profile.saveProfile")}
              </button>
              {profileStatus && <p>{profileStatus}</p>}
            </form>
            <form onSubmit={handlePasswordSubmit} style={{ display: "grid", gap: 8 }}>
              <strong>{t("Profile.passwordHeader")}</strong>
              <label>
                {t("Profile.currentPassword")}
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, current_password: e.target.value })
                  }
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 320 }}
                />
              </label>
              <label>
                {t("Profile.newPassword")}
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 320 }}
                />
              </label>
              <label>
                {t("Profile.confirmPassword")}
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  style={{ display: "block", padding: 8, width: "100%", maxWidth: 320 }}
                />
              </label>
              <button type="submit" style={{ padding: "8px 12px", width: "fit-content" }}>
                {t("Profile.updatePassword")}
              </button>
              {passwordStatus && <p>{passwordStatus}</p>}
            </form>
          </section>
        )}
      </main>
    </>
  );
}
