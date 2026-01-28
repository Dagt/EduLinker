import { useEffect, useState } from "react";
import { View, Text, Button, Alert, ScrollView, TextInput } from "react-native";
import * as Clipboard from "expo-clipboard";
import i18n from "../i18n";
import { changePassword, getMe, regenerateIcsToken, updateMe } from "../api";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
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
    await Clipboard.setStringAsync(profile.calendar_subscription_url);
    Alert.alert(i18n.t("profile.copied"));
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

  const handleSaveProfile = async () => {
    try {
      await updateMe(formData);
      await refreshProfile();
      Alert.alert(i18n.t("profile.updateSuccess"));
    } catch (err) {
      console.error(err);
      Alert.alert(i18n.t("profile.updateError"));
    }
  };

  const handlePassword = async () => {
    try {
      await changePassword(passwordForm);
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      Alert.alert(i18n.t("profile.passwordSuccess"));
    } catch (err) {
      console.error(err);
      Alert.alert(i18n.t("profile.passwordError"));
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      i18n.t("profile.regenerateTitle"),
      i18n.t("profile.regenerateConfirm"),
      [
        { text: i18n.t("general.cancel"), style: "cancel" },
        {
          text: i18n.t("profile.regenerateToken"),
          style: "destructive",
          onPress: async () => {
            try {
              await regenerateIcsToken();
              await refreshProfile();
              Alert.alert(i18n.t("profile.regenerateSuccess"));
            } catch (err) {
              console.error(err);
              Alert.alert(i18n.t("profile.regenerateError"));
            }
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={{ padding: 16 }}>
        <Text>{i18n.t("general.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>{i18n.t("profile.title")}</Text>
      <Text>{i18n.t("profile.name")}: {profile.first_name} {profile.last_name}</Text>
      <Text>{i18n.t("profile.email")}: {profile.email}</Text>
      <Text>{i18n.t("profile.role")}: {profile.role}</Text>
      <Text>{i18n.t("profile.icsToken")}: {profile.ics_token}</Text>
      <Text>{i18n.t("profile.calendarLink")}: {profile.calendar_subscription_url}</Text>
      <Button title={i18n.t("profile.copyLink")} onPress={handleCopy} />
      <Button title={i18n.t("profile.regenerateToken")} onPress={handleRegenerate} />
      <Text style={{ color: "#6b7280" }}>{i18n.t("profile.confidential")}</Text>
      <View style={{ marginTop: 16, gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>{i18n.t("profile.editHeader")}</Text>
        <Text>{i18n.t("profile.firstName")}</Text>
        <TextInput
          value={formData.first_name}
          onChangeText={(text) => setFormData({ ...formData, first_name: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Text>{i18n.t("profile.lastName")}</Text>
        <TextInput
          value={formData.last_name}
          onChangeText={(text) => setFormData({ ...formData, last_name: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Text>{i18n.t("profile.preferredLanguage")}</Text>
        <TextInput
          value={formData.preferred_language}
          onChangeText={(text) => setFormData({ ...formData, preferred_language: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Button title={i18n.t("profile.saveProfile")} onPress={handleSaveProfile} />
      </View>
      <View style={{ marginTop: 16, gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>{i18n.t("profile.passwordHeader")}</Text>
        <Text>{i18n.t("profile.currentPassword")}</Text>
        <TextInput
          secureTextEntry
          value={passwordForm.current_password}
          onChangeText={(text) => setPasswordForm({ ...passwordForm, current_password: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Text>{i18n.t("profile.newPassword")}</Text>
        <TextInput
          secureTextEntry
          value={passwordForm.new_password}
          onChangeText={(text) => setPasswordForm({ ...passwordForm, new_password: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Text>{i18n.t("profile.confirmPassword")}</Text>
        <TextInput
          secureTextEntry
          value={passwordForm.confirm_password}
          onChangeText={(text) => setPasswordForm({ ...passwordForm, confirm_password: text })}
          style={{ borderWidth: 1, borderColor: "#e5e7eb", padding: 8, borderRadius: 6 }}
        />
        <Button title={i18n.t("profile.updatePassword")} onPress={handlePassword} />
      </View>
    </ScrollView>
  );
}
