import { useEffect, useState } from "react";
import { View, Text, Button, Alert, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import i18n from "../i18n";
import { apiGet } from "../api";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet("/me/");
        setProfile(me);
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
      <Text style={{ color: "#6b7280" }}>{i18n.t("profile.confidential")}</Text>
    </ScrollView>
  );
}
