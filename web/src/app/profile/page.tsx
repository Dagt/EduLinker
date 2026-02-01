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
      <main className="page narrow">
        <header className="page-header compact">
          <div>
            <span className="pill">{t("Profile.header")}</span>
            <h2>{t("Profile.header")}</h2>
            <p className="subtle">{t("Profile.subtitle", { defaultValue: "Informacion y preferencias de tu cuenta." })}</p>
          </div>
        </header>
        {!profile ? (
          <p>{t("General.loading")}</p>
        ) : (
          <section className="grid-2">
            <section className="card">
              <h3>{t("Profile.header")}</h3>
              <div className="form">
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
                  <div className="mono">{profile.ics_token}</div>
                </div>
                <div>
                  <strong>{t("Profile.calendarLink")}</strong>
                  <div className="break">{profile.calendar_subscription_url}</div>
                </div>
                <div className="actions">
                  <button className="button secondary" onClick={handleCopy}>
                    {t("Profile.copyLink")}
                  </button>
                  <button className="button secondary" onClick={handleRegenerate}>
                    {t("Profile.regenerateToken")}
                  </button>
                </div>
                {copyStatus && <p className="alert success">{copyStatus}</p>}
                {regenerateStatus && <p className="alert success">{regenerateStatus}</p>}
                <p className="subtle">{t("Profile.confidential")}</p>
              </div>
            </section>
            <section className="card">
              <form className="form" onSubmit={handleProfileSubmit}>
                <strong>{t("Profile.editHeader")}</strong>
                <label>
                  {t("Profile.firstName")}
                  <input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </label>
                <label>
                  {t("Profile.lastName")}
                  <input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </label>
                <label>
                  {t("Profile.preferredLanguage")}
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  >
                    <option value="es">{t("Profile.languageSpanish")}</option>
                    <option value="en">{t("Profile.languageEnglish")}</option>
                  </select>
                </label>
                <button className="button" type="submit">
                  {t("Profile.saveProfile")}
                </button>
                {profileStatus && <p className="alert success">{profileStatus}</p>}
              </form>
            </section>
            <section className="card">
              <form className="form" onSubmit={handlePasswordSubmit}>
                <strong>{t("Profile.passwordHeader")}</strong>
                <label>
                  {t("Profile.currentPassword")}
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, current_password: e.target.value })
                    }
                  />
                </label>
                <label>
                  {t("Profile.newPassword")}
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
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
                  />
                </label>
                <button className="button" type="submit">
                  {t("Profile.updatePassword")}
                </button>
                {passwordStatus && <p className="alert success">{passwordStatus}</p>}
              </form>
            </section>
          </section>
        )}
      </main>
    </>
  );
}

